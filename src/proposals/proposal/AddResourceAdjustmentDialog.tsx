import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  Proposal,
  RequestedOffering,
  marketplacePublicOfferingsRetrieve,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProtectedCallsOfferingsList,
} from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
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

  const [selectedOffering, setSelectedOffering] =
    useState<RequestedOffering | null>(null);
  const [attributes, setAttributes] = useState<Record<string, number>>({});
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
      }).then(
        (r) => (Array.isArray(r.data) ? r.data : []) as RequestedOffering[],
      ),
    refetchOnWindowFocus: false,
  });

  // Fetch full offering details to get resource_options
  const { data: offeringDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['offering', selectedOffering?.offering_uuid],
    queryFn: () =>
      marketplacePublicOfferingsRetrieve({
        path: { uuid: selectedOffering.offering_uuid },
      }).then((r) => r.data),
    enabled: !!selectedOffering?.offering_uuid,
    refetchOnWindowFocus: false,
  });

  const resourceOptions = useMemo(
    () => getResourceOptions(offeringDetails),
    [offeringDetails],
  );

  const handleOfferingSelect = useCallback(
    (uuid: string) => {
      const offering = offerings?.find((o) => o.uuid === uuid);
      setSelectedOffering(offering || null);
      setAttributes({});
    },
    [offerings],
  );

  const handleChange = useCallback((key: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setAttributes((prev) => ({ ...prev, [key]: numValue }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedOffering) return;

    const adjustedAttributes: Record<string, number> = {};
    for (const option of resourceOptions) {
      if (option.key in attributes) {
        adjustedAttributes[option.key] = attributes[option.key];
      }
    }

    setIsSubmitting(true);
    try {
      await proposalProposalsResourceAdjustmentsCreate({
        path: { uuid: proposal.uuid },
        body: {
          call_offering_uuid: selectedOffering.uuid,
          action: 'add',
          adjusted_attributes: adjustedAttributes,
        },
      });

      dispatch(
        showSuccess(translate('Resource has been added to allocation.')),
      );
      dispatch(closeModalDialog('HIDE_CONFIRM'));
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add resource.')));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    proposal.uuid,
    selectedOffering,
    attributes,
    resourceOptions,
    dispatch,
    refetch,
  ]);

  const handleCancel = () => {
    dispatch(closeModalDialog('HIDE_CONFIRM'));
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

          {selectedOffering && isLoadingDetails && <LoadingSpinner />}

          {selectedOffering &&
            !isLoadingDetails &&
            resourceOptions.length > 0 && (
              <>
                <hr />
                <p className="text-muted mb-3">
                  {translate('Set allocation:')}
                </p>
                {resourceOptions.map((option) => (
                  <Form.Group key={option.key} className="mb-3">
                    <Form.Label>{option.label}</Form.Label>
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
                      placeholder={translate('default')}
                      onChange={(e) => handleChange(option.key, e.target.value)}
                    />
                  </Form.Group>
                ))}
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
