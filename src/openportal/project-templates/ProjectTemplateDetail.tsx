import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { openportalProjectTemplateRetrieve } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { EditAction } from '@waldur/form/EditAction';
import { TrashIcon } from '@phosphor-icons/react';

import { deleteProjectTemplate } from '../api';

const ProjectTemplateEditDialog = lazyComponent(() =>
  import('./ProjectTemplateEditDialog').then((module) => ({
    default: module.ProjectTemplateEditDialog,
  })),
);

// --- Layout ---

const Section: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <Card>
    <Card.Header className="py-2 d-flex align-items-center justify-content-between">
      <span className="text-muted text-uppercase fs-8 fw-bold">{title}</span>
    </Card.Header>
    <Card.Body className="py-3">{children}</Card.Body>
  </Card>
);

const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row mb-2">
    <div className="col-5 fw-semibold text-muted">{label}</div>
    <div className="col-7">{children}</div>
  </div>
);

// --- Actions ---

const EditTemplateAction: FC<{ row: any; refetch: any }> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ProjectTemplateEditDialog, {
        resolve: {
          initialValues: { uuid: row.uuid, content: row.content },
          refetch,
        },
        size: 'lg',
      }),
    );
  return <EditAction action={callback} size="sm" />;
};

const DeleteAndGoBack: FC<{ row: any; refetch?: any }> = ({ row }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete project template'),
        translate('Are you sure you would like to delete this project template?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await deleteProjectTemplate({ uuid: row.uuid });
      dispatch(showSuccess(translate('Project template has been deleted.')));
      router.stateService.go('marketplace-provider-project-templates');
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete this project template.')));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={action}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};

// --- Field renderers ---

const renderOrganisation = (customer: any): ReactNode => {
  if (!customer) return <span className="text-muted">—</span>;
  const url = `/organizations/${customer.uuid}/dashboard/`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {customer.display_name || customer.name}
    </a>
  );
};

const renderOfferings = (offerings: any[], providerUuid: string): ReactNode => {
  if (!offerings || offerings.length === 0)
    return <span className="text-muted">{translate('No offerings')}</span>;
  return (
    <div>
      {offerings.map((offering) => {
        const url = `/providers/${providerUuid}/marketplace-provider-offering-details/${offering.uuid}/`;
        return (
          <div key={offering.uuid}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {offering.name}
            </a>
          </div>
        );
      })}
    </div>
  );
};

const renderRoleMapping = (roleMapping: any): ReactNode => {
  if (!roleMapping || Object.keys(roleMapping).length === 0)
    return <span className="text-muted">{translate('No role mapping')}</span>;
  return (
    <div>
      {Object.entries(roleMapping).map(([key, value]: [string, any]) => (
        <div key={key} className="row mb-1">
          <div className="col-5 text-muted">{key}</div>
          <div className="col-7">{value?.description || value?.name || value?.uuid || translate('Not set')}</div>
        </div>
      ))}
    </div>
  );
};

const renderAllocationMapping = (allocationMapping: any): ReactNode => {
  if (!allocationMapping || Object.keys(allocationMapping).length === 0)
    return <span className="text-muted">{translate('No allocation mapping')}</span>;
  return (
    <div>
      {Object.entries(allocationMapping).map(([key, value]: [string, any]) => (
        <div key={key} className="mb-1">
          1 credit = {String(value)} {key}
        </div>
      ))}
    </div>
  );
};

// --- Main page ---

export const ProjectTemplateDetail = () => {
  const { params } = useCurrentStateAndParams();
  const uuid = params.templateUuid as string;
  const router = useRouter();

  const goBack = () => router.stateService.go('marketplace-provider-project-templates');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['project-template-detail', uuid],
    queryFn: async () => {
      const result = await openportalProjectTemplateRetrieve({ path: { uuid } });
      return result.data;
    },
    staleTime: 0,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const doRefetch = async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 500));
    await refetch();
  };

  const offeringLabel = data?.offering
    ? data.offering.split('.').pop()
    : null;
  const pageTitle = data
    ? [data.name, offeringLabel].filter(Boolean).join(' | ')
    : translate('Project Template');

  useTitle(pageTitle || translate('Project Template'), '', 'browser');

  if (isLoading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 text-muted">
        <LoadingSpinnerIcon className="me-2" />
        {translate('Loading...')}
      </div>
    );
  }

  if (!data) return null;

  const actions = [EditTemplateAction, DeleteAndGoBack];

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={goBack}
            title={translate('Back to Project Templates')}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h4 className="mb-0">{pageTitle}</h4>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={doRefetch}
            disabled={isFetching}
          >
            {isFetching && <LoadingSpinnerIcon className="me-1" />}
            {translate('Refresh')}
          </Button>
          <ActionsDropdown row={data} refetch={doRefetch} actions={actions} />
        </div>
      </div>

      <div className="row g-3">

        {/* Identity */}
        <div className="col-md-6">
          <Section title={translate('Identity')}>
            <Field label={translate('Name')}>{data.name || <span className="text-muted">—</span>}</Field>
            <Field label={translate('Key')}>{data.key || <span className="text-muted">—</span>}</Field>
            <Field label={translate('Shortname')}>{data.shortname || <span className="text-muted">—</span>}</Field>
            <Field label={translate('Portal')}>{data.portal || <span className="text-muted">—</span>}</Field>
            <Field label={translate('Offering')}>{data.offering || <span className="text-muted">—</span>}</Field>
          </Section>
        </div>

        {/* Organisation */}
        <div className="col-md-6">
          <Section title={translate('Organisation')}>
            <Field label={translate('Organisation')}>
              {renderOrganisation((data as any).customer_data)}
            </Field>
          </Section>
        </div>

        {/* Limits */}
        <div className="col-md-6">
          <Section title={translate('Limits')}>
            <Field label={translate('Approval limit')}>
              {(data as any).approval_limit ?? <span className="text-muted">—</span>}
            </Field>
            <Field label={translate('Max credit limit')}>
              {(data as any).max_credit_limit ?? <span className="text-muted">—</span>}
            </Field>
          </Section>
        </div>

        {/* Offerings */}
        <div className="col-md-6">
          <Section title={translate('Offerings')}>
            {renderOfferings((data as any).offerings_data, data.provider_data?.uuid)}
          </Section>
        </div>

        {/* Role mapping */}
        <div className="col-12">
          <Section title={translate('Role Mapping')}>
            {renderRoleMapping((data as any).role_mapping)}
          </Section>
        </div>

        {/* Allocation mapping */}
        <div className="col-12">
          <Section title={translate('Allocation Mapping')}>
            {renderAllocationMapping((data as any).allocation_units_mapping)}
          </Section>
        </div>

      </div>
    </div>
  );
};
