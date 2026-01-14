import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useCallback, useMemo } from 'react';
import { reduxForm, formValueSelector } from 'redux-form';
import { NestedRound, proposalProposalsCreate } from 'waldur-js-client';
import { useSelector } from 'react-redux';

import { required, composeValidators, createProposalNameValidator } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { EndingField } from '@waldur/proposals/EndingField';
import { Call } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { useNotify } from '@waldur/store/hooks';
import { UsersService } from '@waldur/user/UsersService';

interface FormData {
  name: string;
}

const selector = formValueSelector('AddProposalForm');

export const AddProposalDialog = reduxForm<
  FormData,
  { resolve: { round: NestedRound; call: Call } }
>({
  form: 'AddProposalForm',
})((props) => {
  const router = useRouter();
  const { showSuccess, showErrorResponse } = useNotify();
  const proposalName = useSelector((state) => selector(state, 'name')) || '';

  // Get call prefix (backend_id or slug)
  const callPrefix = props.resolve.call.backend_id || props.resolve.call.slug || '';

  // Calculate maximum allowed length for proposal name
  const maxProposalNameLength = useMemo(() => {
    // Formula: 150 - callPrefix.length - 10 - 6
    return 150 - callPrefix.length - 10 - 6;
  }, [callPrefix]);

  // Create validator with the calculated max length
  const nameValidator = useMemo(
    () => composeValidators(required, createProposalNameValidator(callPrefix)),
    [callPrefix]
  );

  const processRequest = useCallback(
    async (values: FormData) => {
      try {
        const response = await proposalProposalsCreate({
          body: {
            ...values,
            round_uuid: props.resolve.round.uuid,
          },
        });
        const proposal = response.data;
        showSuccess(translate('Proposal created successfully'));
        UsersService.refreshCurrentUser();
        router.stateService.go('proposals.manage-proposal', {
          proposal_uuid: proposal.uuid,
        });
      } catch (error) {
        showErrorResponse(error, translate('Something went wrong'));
      }
    },
    [props.resolve, router],
  );

  return (
    <form onSubmit={props.handleSubmit(processRequest)}>
      <ModalDialog
        title={translate('Create proposal')}
        iconNode={<PlusCircleIcon weight="bold" />}
        iconColor="success"
        footer={
          <>
            <CloseDialogButton variant="tertiary" className="w-125px" />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Create')}
              className="btn btn-primary w-125px"
            />
          </>
        }
      >
        <Field
          label={translate('Call name')}
          value={props.resolve.call.name}
          labelCol={4}
          valueCol={8}
          space={2}
        />
        <Field
          label={translate('Round reference')}
          value={props.resolve.round.name}
          labelCol={4}
          valueCol={8}
          space={2}
        />
        <Field
          label={translate('Round deadline')}
          value={
            <EndingField
              endDate={props.resolve.round.cutoff_time}
              dateFirst
              hasFixedDuration={Boolean(
                props.resolve.call.fixed_duration_in_days,
              )}
            />
          }
          labelCol={4}
          valueCol={8}
          space={2}
        />
        <FormContainer submitting={props.submitting} className="mt-7">
          <StringField
            label={translate('Name')}
            name="name"
            required
            validate={nameValidator}
            description={translate(
              'Maximum {maxLength} characters. Current: {current}/{maxLength}',
              {
                maxLength: maxProposalNameLength,
                current: proposalName.length,
              }
            )}
            spaceless
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
