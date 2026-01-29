import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  EffectiveAllocationItem,
  Proposal,
  marketplacePublicOfferingsRetrieve,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsPartialUpdate,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface ResourceOption {
  key: string;
  label: string;
  help_text?: string;
  type: string;
  min?: number;
  max?: number;
  required?: boolean;
}

const getResourceOptions = (offering: any): ResourceOption[] => {
  if (!offering?.resource_options?.options) return [];
  const order: string[] = offering.resource_options.order || [];
  const options = offering.resource_options.options;
  // Use the order array, falling back to Object.keys
  const keys = order.length > 0 ? order : Object.keys(options);
  return keys
    .filter((key) => key in options)
    .map((key) => ({
      key,
      label: options[key].label || key,
      help_text: options[key].help_text,
      type: options[key].type || 'integer',
      min: options[key].min,
      max: options[key].max,
      required: options[key].required,
    }));
};

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
  const dispatch = useDispatch();

  // Fetch offering details to get resource_options
  const { data: offering, isLoading: isLoadingOffering } = useQuery({
    queryKey: ['offering', allocationItem.offering_uuid],
    queryFn: () =>
      marketplacePublicOfferingsRetrieve({
        path: { uuid: allocationItem.offering_uuid },
      }).then((r) => r.data),
    refetchOnWindowFocus: false,
  });

  const resourceOptions = useMemo(
    () => getResourceOptions(offering),
    [offering],
  );

  // Get current effective attribute values
  const currentAttributes = useMemo(() => {
    return (
      (allocationItem.effective_attributes as Record<string, unknown>) || {}
    );
  }, [allocationItem.effective_attributes]);

  const originalAttributes = useMemo(() => {
    return (
      (allocationItem.original_attributes as Record<string, unknown>) || {}
    );
  }, [allocationItem.original_attributes]);

  const [attributes, setAttributes] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (key in currentAttributes)
        return currentAttributes[key] as number;
      return null;
    },
    [attributes, currentAttributes],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const adjustedAttributes: Record<string, number> = {};
      for (const option of resourceOptions) {
        const val = getEffectiveValue(option.key);
        if (val !== null) {
          adjustedAttributes[option.key] = val;
        }
      }

      const existingAdjustment = allocationItem.adjustment as any;

      if (existingAdjustment?.uuid) {
        await proposalProposalsResourceAdjustmentsPartialUpdate({
          path: {
            uuid: proposal.uuid,
            obj_uuid: existingAdjustment.uuid,
          },
          body: {
            adjusted_attributes: adjustedAttributes,
          },
        });
      } else {
        await proposalProposalsResourceAdjustmentsCreate({
          path: { uuid: proposal.uuid },
          body: {
            requested_resource_uuid: allocationItem.requested_resource_uuid,
            action: 'modify',
            adjusted_attributes: adjustedAttributes,
          },
        });
      }

      dispatch(showSuccess(translate('Allocation has been updated.')));
      dispatch(closeModalDialog('HIDE_CONFIRM'));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update allocation.')),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    proposal.uuid,
    allocationItem,
    resourceOptions,
    getEffectiveValue,
    dispatch,
    refetch,
  ]);

  const handleCancel = () => {
    dispatch(closeModalDialog('HIDE_CONFIRM'));
  };

  return (
    <ModalDialog
      title={translate('Adjust allocation')}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingOffering}
          >
            {translate('Save')}
          </Button>
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
        <Form>
          {resourceOptions.map((option) => {
            const currentValue = getEffectiveValue(option.key);
            const originalValue = originalAttributes[option.key] as
              | number
              | undefined;
            const originalLabel =
              originalValue != null
                ? String(originalValue)
                : translate('default');
            return (
              <Form.Group key={option.key} className="mb-3">
                <Form.Label>
                  {option.label}{' '}
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
                  placeholder={translate('default')}
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
