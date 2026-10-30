import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { proposalProposalsReturnToApplicant } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { DateTimeGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { PROPOSAL_RETURNS_QUERY_KEY } from './permissions';

interface ReturnFormValues {
  reason?: string;
  resubmit_by?: string | null;
}

interface ReturnToApplicantDialogProps {
  resolve: {
    proposal: { uuid: string; name?: string };
    refetch?(): void;
  };
}

// The backend trims the reason, so spaces alone would arrive empty.
export const validateReason = (value?: string) =>
  value?.trim() ? undefined : translate('This field is required.');

export const validateResubmitBy = (value?: string | null) => {
  if (!value) return translate('This field is required.');
  return new Date(value) <= new Date()
    ? translate('The deadline must be in the future.')
    : undefined;
};

/** Two weeks from now, at the end of that day's working hours. */
export const defaultResubmitBy = (): string =>
  DateTime.now()
    .plus({ weeks: 2 })
    .set({ hour: 17, minute: 0, second: 0, millisecond: 0 })
    .toISO();

/**
 * Hands a submitted proposal back to its applicant to fix: a decision beside
 * accepting and rejecting. The applicant is sent the reason and may resubmit
 * until the deadline, even after the round's cut-off.
 */
export const ReturnToApplicantDialog: FC<ReturnToApplicantDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const openedAt = useMemo(() => new Date(), []);
  const initialValues = useMemo<ReturnFormValues>(
    () => ({ resubmit_by: defaultResubmitBy() }),
    [],
  );
  const returnProposal = useManagedMutation<any, any, ReturnFormValues>({
    mutationFn: (values) =>
      proposalProposalsReturnToApplicant({
        path: { uuid: proposal.uuid },
        body: {
          reason: values.reason.trim(),
          resubmit_by: new Date(values.resubmit_by).toISOString(),
        },
      }),
    successMessage: translate(
      'The proposal has been returned to its applicant.',
    ),
    errorMessage: translate('Unable to return the proposal.'),
    refetch,
    invalidateQueries: [
      { queryKey: [PROPOSAL_RETURNS_QUERY_KEY, proposal.uuid] },
    ],
  });

  return (
    <Form<ReturnFormValues>
      onSubmit={(values) => returnProposal.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Return to applicant')}
            subtitle={proposal.name}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Return to applicant')}
                />
              </>
            }
          >
            <AlertItem
              variant="warning"
              className="mb-5"
              title={translate('The proposal becomes a draft again')}
              body={translate(
                'Its open reviews are cancelled, and its workflow starts again when the applicant resubmits. The applicant may change anything, forms included, and resubmit until the deadline, even after the round has closed.',
              )}
            />
            <TextGroup
              name="reason"
              label={translate('Reason')}
              description={translate(
                'Sent to the applicant: say what to change.',
              )}
              required
              validate={validateReason}
              rows={5}
            />
            <DateTimeGroup
              name="resubmit_by"
              label={translate('Resubmit by')}
              description={translate(
                'Nothing happens on its own when it passes: the applicant can no longer submit, and you decide whether to extend it.',
              )}
              required
              // A Date, not "today": with times enabled it bounds the hours
              // and minutes of today as well as earlier days.
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
