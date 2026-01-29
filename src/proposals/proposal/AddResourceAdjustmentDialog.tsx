import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProtectedCallsOfferingsList,
} from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { CallOffering } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface AddResourceAdjustmentDialogProps {
  resolve: {
    proposal: Proposal;
    refetch: () => void;
  };
}

export const AddResourceAdjustmentDialog: FC<
  AddResourceAdjustmentDialogProps
> = ({ resolve: { proposal, refetch } }) => {
  const dispatch = useDispatch();

  const [selectedOffering, setSelectedOffering] = useState<CallOffering | null>(
    null,
  );
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: offerings,
    isLoading,
    error,
    refetch: refetchOfferings,
  } = useQuery({
    queryKey: ['callOfferings', proposal.call_uuid],
    queryFn: () =>
      proposalProtectedCallsOfferingsList({
        path: { uuid: proposal.call_uuid },
        query: { state: ['accepted'] },
      }).then((r) => r.data.results as CallOffering[]),
    refetchOnWindowFocus: false,
  });

  const componentKeys = useMemo(() => {
    if (!selectedOffering?.components) return [];
    return selectedOffering.components
      .filter((c) => c.billing_type === 'limit')
      .map((c) => ({
        type: c.type,
        name: c.name,
      }));
  }, [selectedOffering]);

  const handleOfferingSelect = useCallback(
    (uuid: string) => {
      const offering = offerings?.find((o) => o.uuid === uuid);
      setSelectedOffering(offering || null);
      setLimits({});
    },
    [offerings],
  );

  const handleLimitChange = useCallback((key: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLimits((prev) => ({ ...prev, [key]: numValue }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedOffering) return;

    setIsSubmitting(true);
    try {
      await proposalProposalsResourceAdjustmentsCreate({
        path: { uuid: proposal.uuid },
        body: {
          call_offering_uuid: selectedOffering.uuid,
          action: 'add',
          adjusted_limits: limits,
        },
      });

      dispatch(
        showSuccess(translate('Resource has been added to allocation.')),
      );
      dispatch(closeModalDialog());
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add resource.')));
    } finally {
      setIsSubmitting(false);
    }
  }, [proposal.uuid, selectedOffering, limits, dispatch, refetch]);

  const handleCancel = () => {
    dispatch(closeModalDialog());
  };

  return (
    <ModalDialog
      title={translate('Add resource to allocation')}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedOffering}
          >
            {translate('Add')}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetchOfferings} />
      ) : (
        <Form>
          <Form.Group className="mb-3">
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

          {selectedOffering && componentKeys.length > 0 && (
            <>
              <hr />
              <p className="text-muted mb-3">{translate('Set limits:')}</p>
              {componentKeys.map(({ type, name }) => (
                <Form.Group key={type} className="mb-3">
                  <Form.Label>{name}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={limits[type] ?? 0}
                    onChange={(e) => handleLimitChange(type, e.target.value)}
                  />
                </Form.Group>
              ))}
            </>
          )}

          {selectedOffering && componentKeys.length === 0 && (
            <p className="text-muted">
              {translate('No configurable limits for this offering.')}
            </p>
          )}
        </Form>
      )}
    </ModalDialog>
  );
};
