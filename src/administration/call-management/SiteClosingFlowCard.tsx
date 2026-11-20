import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  customersRetrieve,
  formFlowsList,
  PatchedSiteClosingFormFlowRequest,
  siteClosingFormFlowPartialUpdate,
  siteClosingFormFlowRetrieve,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  AsyncSelectEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { validateOpenDays } from '@/proposals/forms/CallFormFlowField';
import { isStaff } from '@/workspace/selectors';

import { FORM_FLOWS_QUERY_KEY } from './FormFlowDialog';

export const SITE_CLOSING_FLOW_QUERY_KEY = ['SiteClosingFormFlow'];

const STAFF_ONLY = translate('Only staff can change this.');

/**
 * The end-of-project forms for projects whose call names none, which
 * includes every existing award: they were not made from a proposal. May
 * be limited to some organisations. Staff edit it; support reads it.
 */
export const SiteClosingFlowCard = () => {
  const canEdit = useSelector(isStaff);
  const queryClient = useQueryClient();

  const {
    data: setting,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SITE_CLOSING_FLOW_QUERY_KEY,
    queryFn: () =>
      siteClosingFormFlowRetrieve().then((response) => response.data),
  });

  const { data: flows } = useQuery({
    queryKey: [FORM_FLOWS_QUERY_KEY],
    queryFn: () => getAllPages((page) => formFlowsList({ query: { page } })),
    refetchOnWindowFocus: false,
  });

  // The setting holds organisation UUIDs; the picker shows names.
  const customerUuids = setting?.customers ?? [];
  const { data: customers } = useQuery({
    queryKey: ['SiteClosingFormFlowCustomers', customerUuids],
    queryFn: () =>
      Promise.all(
        customerUuids.map((uuid) =>
          customersRetrieve({
            path: { uuid },
            query: { field: ['uuid', 'name'] },
          }).then((response) => response.data),
        ),
      ),
    enabled: customerUuids.length > 0,
  });

  const flowOptions = useMemo(
    () => [
      { value: null, label: translate('None') },
      ...(flows ?? [])
        .filter((flow) => flow.purpose === 'closing')
        .map((flow) => ({ value: flow.uuid, label: flow.name })),
    ],
    [flows],
  );
  const loadOrganizations = useMemo(
    () => organizationAutocomplete({ field: ['name', 'uuid'], o: 'name' }),
    [],
  );

  const { mutateAsync: update } = useManagedMutation({
    mutationFn: (changes: Record<string, any>) => {
      const body: PatchedSiteClosingFormFlowRequest = {};
      if ('flow' in changes) body.flow = changes.flow ?? null;
      if ('closing_forms_open_days_before_end' in changes) {
        body.closing_forms_open_days_before_end = Number(
          changes.closing_forms_open_days_before_end || 0,
        );
      }
      if ('customers' in changes) {
        body.customers = (changes.customers ?? []).map(
          (customer) => customer.uuid,
        );
      }
      return siteClosingFormFlowPartialUpdate({ body });
    },
    successMessage: translate('The end-of-project forms have been updated.'),
    errorMessage: translate('Unable to update the end-of-project forms.'),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SITE_CLOSING_FLOW_QUERY_KEY }),
    closeModal: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !setting) {
    return (
      <LoadingErred
        message={translate('Unable to load the end-of-project forms.')}
        loadData={refetch}
      />
    );
  }

  const scope = {
    flow: setting.flow ?? null,
    closing_forms_open_days_before_end:
      setting.closing_forms_open_days_before_end ?? 0,
    customers: customers ?? [],
  };

  return (
    <FormTable.Card
      title={translate('End-of-project forms')}
      className="card-bordered mb-5"
    >
      <EditFieldProvider
        scope={scope}
        callback={update}
        readOnlyReason={canEdit ? undefined : STAFF_ONLY}
      >
        <p className="text-muted px-6 pt-4 mb-0">
          {translate(
            'End-of-project forms for projects whose call has none (including existing awards).',
          )}
        </p>
        <FormTable>
          <SelectEditField
            name="flow"
            label={translate('Form flow')}
            description={translate(
              "An end-of-project flow, filled in by each project's PI near its end date.",
            )}
            options={flowOptions}
            simpleValue
            isClearable={false}
            disabled={!canEdit}
            renderValue={() => setting.flow_name || translate('None')}
          />
          <NumberEditField
            name="closing_forms_open_days_before_end"
            label={translate('Open')}
            description={translate(
              "Open N days before the project's end date; 0 is on the end date. They stay open afterwards.",
            )}
            disabled={!canEdit}
            validate={validateOpenDays}
            renderValue={(value) =>
              Number(value)
                ? translate('{days} days before the end date', { days: value })
                : translate('On the end date')
            }
          />
          <AsyncSelectEditField
            name="customers"
            label={translate('Organisations')}
            description={translate(
              'Only these organisations; leave empty for all.',
            )}
            loadOptions={loadOrganizations}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            isMulti
            isClearable
            placeholder={translate('All organisations')}
            disabled={!canEdit}
            renderValue={() =>
              customerUuids.length
                ? (customers ?? []).map((customer) => customer.name).join(', ')
                : translate('All organisations')
            }
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
