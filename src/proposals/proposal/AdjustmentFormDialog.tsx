import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  EffectiveAllocationItem,
  Proposal,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsPartialUpdate,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

  // Initialize limits from effective_limits (which includes any existing adjustments)
  const initialLimits = useMemo(() => {
    const limits = allocationItem.effective_limits as Record<string, number>;
    return limits || {};
  }, [allocationItem.effective_limits]);

  const [limits, setLimits] = useState<Record<string, number>>(initialLimits);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limitKeys = useMemo(() => {
    // Get all limit keys from both original and effective limits
    const originalKeys = Object.keys(
      (allocationItem.original_limits as Record<string, number>) || {},
    );
    const effectiveKeys = Object.keys(initialLimits);
    return [...new Set([...originalKeys, ...effectiveKeys])];
  }, [allocationItem.original_limits, initialLimits]);

  const handleLimitChange = useCallback((key: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLimits((prev) => ({ ...prev, [key]: numValue }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const existingAdjustment = allocationItem.adjustment as any;

      if (existingAdjustment?.uuid) {
        // Update existing adjustment
        await proposalProposalsResourceAdjustmentsPartialUpdate({
          path: {
            uuid: proposal.uuid,
            obj_uuid: existingAdjustment.uuid,
          },
          body: {
            adjusted_limits: limits,
          },
        });
      } else {
        // Create new adjustment
        await proposalProposalsResourceAdjustmentsCreate({
          path: { uuid: proposal.uuid },
          body: {
            requested_resource_uuid: allocationItem.requested_resource_uuid,
            action: 'modify',
            adjusted_limits: limits,
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
  }, [proposal.uuid, allocationItem, limits, dispatch, refetch]);

  const handleCancel = () => {
    dispatch(closeModalDialog('HIDE_CONFIRM'));
  };

  return (
    <ModalDialog
      title={translate('Adjust allocation limits')}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {translate('Save')}
          </Button>
        </>
      }
    >
      <p className="mb-4">
        {translate('Adjust the resource limits for "{name}".', {
          name: allocationItem.offering_name,
        })}
      </p>

      {limitKeys.length === 0 ? (
        <p className="text-muted">
          {translate('No configurable limits for this resource.')}
        </p>
      ) : (
        <Form>
          {limitKeys.map((key) => {
            const originalValue =
              (allocationItem.original_limits as Record<string, number>)?.[
                key
              ] ?? 0;
            return (
              <Form.Group key={key} className="mb-3">
                <Form.Label>
                  {key}{' '}
                  <span className="text-muted">
                    ({translate('Original')}: {originalValue})
                  </span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={limits[key] ?? 0}
                  onChange={(e) => handleLimitChange(key, e.target.value)}
                />
              </Form.Group>
            );
          })}
        </Form>
      )}
    </ModalDialog>
  );
};
