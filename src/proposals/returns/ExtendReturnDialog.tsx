import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { proposalProposalsExtendReturn } from 'waldur-js-client';

import { DateTimeGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { PROPOSAL_RETURNS_QUERY_KEY } from './permissions';
import {
  defaultResubmitBy,
  validateResubmitBy,
} from './ReturnToApplicantDialog';

interface ExtendFormValues {
  resubmit_by?: string | null;
}

interface ExtendReturnDialogProps {
  resolve: {
    proposal: { uuid: string };
    /** The deadline now, to start from when it is still ahead. */
    resubmitBy?: string;
    refetch?(): void;
  };
}

/** Moves the deadline of a proposal returned to its applicant. */
export const ExtendReturnDialog: FC<ExtendReturnDialogProps> = ({
  resolve: { proposal, resubmitBy, refetch },
}) => {
  const openedAt = useMemo(() => new Date(), []);
  const initialValues = useMemo<ExtendFormValues>(
    () => ({
      resubmit_by:
        resubmitBy && new Date(resubmitBy) > openedAt
          ? resubmitBy
          : defaultResubmitBy(),
    }),
    [resubmitBy, openedAt],
  );
  const extend = useManagedMutation<any, any, ExtendFormValues>({
    mutationFn: (values) =>
      proposalProposalsExtendReturn({
        path: { uuid: proposal.uuid },
        body: { resubmit_by: new Date(values.resubmit_by).toISOString() },
      }),
    successMessage: translate('The deadline has been moved.'),
    errorMessage: translate('Unable to move the deadline.'),
    refetch,
    invalidateQueries: [
      { queryKey: [PROPOSAL_RETURNS_QUERY_KEY, proposal.uuid] },
    ],
  });

  return (
    <Form<ExtendFormValues>
      onSubmit={(values) => extend.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Extend the deadline')}
            subtitle={translate('The applicant is told of the new deadline.')}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Extend')}
                />
              </>
            }
          >
            <DateTimeGroup
              name="resubmit_by"
              label={translate('Resubmit by')}
              required
              minDate={openedAt}
              validate={validateResubmitBy}
              forceTouched
              placeholder={translate('Select date and time...')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
