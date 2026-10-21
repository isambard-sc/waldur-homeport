import { useCallback, useMemo, useState, FC } from 'react';
import { Form } from 'react-bootstrap';
import {
  EffectiveAllocationItem,
  Proposal,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsPartialUpdate,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  getResourceOptions,
  useOfferingDetailsWithFallback,
} from './resourceOptions';

interface AdjustmentFormDialogProps {
  resolve: {
    proposal: Proposal;
    allocationItem: EffectiveAllocationItem;
    refetch: () => void;
  };
}

export const AdjustmentFormDialog: FC<AdjustmentFormDialogProps> = ({
  resolve: { proposal, allocationItem, refetch },
}) => {
  const { data: offering, isLoading: isLoadingOffering } =
    useOfferingDetailsWithFallback(allocationItem.offering_uuid);

  const resourceOptions = useMemo(
    () => getResourceOptions(offering),
    [offering],
  );

  const allocationUnit = (offering as any)?.service_attributes
    ?.allocation_unit as string | undefined;
  const defaultAllocation = (offering as any)?.service_attributes
    ?.default_allocation as number | undefined;

  const currentAttributes = (allocationItem.effective_attributes ||
    {}) as Record<string, unknown>;
  const originalAttributes = (allocationItem.original_attributes ||
    {}) as Record<string, unknown>;

  const [attributes, setAttributes] = useState<Record<string, number>>({});

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

  const getEffectiveValue = useCallback(
    (key: string): number | null => {
      if (key in attributes) return attributes[key];
      if (key in currentAttributes) return currentAttributes[key] as number;
      return null;
    },
    [attributes, currentAttributes],
  );

  const saveAdjustment = useManagedMutation({
    mutationFn: () => {
      const adjustedAttributes: Record<string, number> = {};
      for (const option of resourceOptions) {
        const value = getEffectiveValue(option.key);
        if (value !== null) {
          adjustedAttributes[option.key] = value;
        }
      }
      const existingAdjustmentUuid = (allocationItem.adjustment as any)?.uuid;
      if (existingAdjustmentUuid) {
        return proposalProposalsResourceAdjustmentsPartialUpdate({
          path: { uuid: proposal.uuid, obj_uuid: existingAdjustmentUuid },
          body: { adjusted_attributes: adjustedAttributes },
        });
      }
      return proposalProposalsResourceAdjustmentsCreate({
        path: { uuid: proposal.uuid },
        body: {
          requested_resource: allocationItem.requested_resource_uuid as string,
          action: 'modify',
          adjusted_attributes: adjustedAttributes,
        },
      });
    },
    refetch,
    successMessage: translate('Allocation has been updated.'),
    errorMessage: translate('Unable to update allocation.'),
  });

  return (
    <ModalDialog
      title={translate('Adjust allocation')}
      footer={
        <>
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            label={translate('Save')}
            disabled={saveAdjustment.isPending || isLoadingOffering}
            disabledReason={
              isLoadingOffering
                ? translate('Loading offering details…')
                : undefined
            }
            onClick={() => saveAdjustment.mutate()}
          />
        </>
      }
    >
      <p className="mb-4">
        {translate('Adjust the resource allocation for "{name}".', {
          name: allocationItem.offering_name,
        })}
      </p>

      {isLoadingOffering ? (
        <LoadingSpinner />
      ) : resourceOptions.length === 0 ? (
        <p className="text-muted">
          {translate('No configurable options for this resource.')}
        </p>
      ) : (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            saveAdjustment.mutate();
          }}
        >
          {resourceOptions.map((option) => {
            const currentValue = getEffectiveValue(option.key);
            const originalValue = originalAttributes[option.key] as
              number | undefined;
            const unitSuffix = allocationUnit ? ` (${allocationUnit})` : '';
            const originalLabel =
              originalValue != null
                ? `${originalValue}${unitSuffix}`
                : translate('default');
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
                  {unitSuffix}{' '}
                  <span className="text-muted">
                    ({translate('Original')}: {originalLabel})
                  </span>
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
                  value={currentValue ?? ''}
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
        </Form>
      )}
    </ModalDialog>
  );
};
