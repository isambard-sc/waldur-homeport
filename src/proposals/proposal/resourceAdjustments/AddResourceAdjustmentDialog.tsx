import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState, FC } from 'react';
import { Form } from 'react-bootstrap';
import {
  Proposal,
  RequestedOffering,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProtectedCallsOfferingsList,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  getResourceOptions,
  useOfferingDetailsWithFallback,
} from './resourceOptions';

interface AddResourceAdjustmentDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

export const AddResourceAdjustmentDialog: FC<
  AddResourceAdjustmentDialogProps
> = ({ resolve: { proposal, refetch } }) => {
  const [selectedOffering, setSelectedOffering] =
    useState<RequestedOffering | null>(null);
  const [attributes, setAttributes] = useState<Record<string, number>>({});

  const {
    data: offerings,
    isLoading,
    error,
    refetch: refetchOfferings,
  } = useQuery({
    queryKey: ['callOfferings', proposal.call_uuid],
    queryFn: () =>
      proposalProtectedCallsOfferingsList({
        path: { uuid: proposal.call_uuid as string },
        query: { state: 'accepted' },
      }).then(
        (r) => (Array.isArray(r.data) ? r.data : []) as RequestedOffering[],
      ),
    refetchOnWindowFocus: false,
  });

  const { data: offeringDetails, isLoading: isLoadingDetails } =
    useOfferingDetailsWithFallback(selectedOffering?.offering_uuid);

  const resourceOptions = useMemo(
    () => getResourceOptions(offeringDetails),
    [offeringDetails],
  );

  const allocationUnit = (offeringDetails as any)?.service_attributes
    ?.allocation_unit as string | undefined;
  const defaultAllocation = (offeringDetails as any)?.service_attributes
    ?.default_allocation as number | undefined;

  const handleOfferingSelect = useCallback(
    (uuid: string) => {
      setSelectedOffering(offerings?.find((o) => o.uuid === uuid) || null);
      setAttributes({});
    },
    [offerings],
  );

  const handleChange = useCallback(
    (key: string, value: string, min?: number, max?: number) => {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        const clamped = Math.max(
          min ?? 0,
          max != null ? Math.min(numValue, max) : numValue,
        );
        setAttributes((prev) => ({ ...prev, [key]: clamped }));
      }
    },
    [],
  );

  const addResource = useManagedMutation({
    mutationFn: () => {
      const adjustedAttributes: Record<string, number> = {};
      for (const option of resourceOptions) {
        if (option.key in attributes) {
          adjustedAttributes[option.key] = attributes[option.key];
        }
      }
      return proposalProposalsResourceAdjustmentsCreate({
        path: { uuid: proposal.uuid },
        body: {
          call_offering: (selectedOffering as RequestedOffering).uuid,
          action: 'add',
          adjusted_attributes: adjustedAttributes,
        },
      });
    },
    refetch,
    successMessage: translate('Resource has been added to the allocation.'),
    errorMessage: translate('Unable to add resource.'),
  });

  return (
    <ModalDialog
      title={translate('Add resource to allocation')}
      footer={
        <>
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            label={translate('Add')}
            disabled={addResource.isPending || !selectedOffering}
            disabledReason={
              !selectedOffering
                ? translate('Select an offering first.')
                : undefined
            }
            onClick={() => addResource.mutate()}
          />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetchOfferings} />
      ) : (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            addResource.mutate();
          }}
        >
          <Form.Group className="mb-3" controlId="adjustment-offering">
            <Form.Label>{translate('Select offering')}</Form.Label>
            <Form.Select
              value={selectedOffering?.uuid || ''}
              onChange={(e) => handleOfferingSelect(e.target.value)}
            >
              <option value="">{translate('Select an offering...')}</option>
              {offerings?.map((offering) => (
                <option key={offering.uuid} value={offering.uuid}>
                  {offering.offering_name} ({offering.provider_name})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedOffering && isLoadingDetails && <LoadingSpinner />}

          {selectedOffering &&
            !isLoadingDetails &&
            resourceOptions.length > 0 && (
              <>
                <hr />
                <p className="text-muted mb-3">
                  {translate('Set allocation:')}
                </p>
                {resourceOptions.map((option) => {
                  const unitSuffix = allocationUnit
                    ? ` (${allocationUnit})`
                    : '';
                  const placeholderLabel =
                    defaultAllocation != null
                      ? `${translate('default')}: ${defaultAllocation}${unitSuffix}`
                      : translate('default');
                  return (
                    <Form.Group
                      key={option.key}
                      className="mb-3"
                      controlId={`adjustment-attribute-${option.key}`}
                    >
                      <Form.Label>
                        {option.label}
                        {unitSuffix}
                      </Form.Label>
                      {option.help_text && (
                        <Form.Text className="d-block mb-1 text-muted">
                          {option.help_text}
                        </Form.Text>
                      )}
                      <Form.Control
                        type="number"
                        min={option.min ?? 0}
                        max={option.max ?? undefined}
                        value={attributes[option.key] ?? ''}
                        placeholder={placeholderLabel}
                        onChange={(e) =>
                          handleChange(
                            option.key,
                            e.target.value,
                            option.min,
                            option.max,
                          )
                        }
                      />
                    </Form.Group>
                  );
                })}
              </>
            )}

          {selectedOffering &&
            !isLoadingDetails &&
            resourceOptions.length === 0 && (
              <p className="text-muted">
                {translate('No configurable options for this offering.')}
              </p>
            )}
        </Form>
      )}
    </ModalDialog>
  );
};
