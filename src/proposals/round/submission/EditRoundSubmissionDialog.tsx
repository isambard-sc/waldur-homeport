import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  proposalProtectedCallsRoundsUpdate,
  ProtectedRound,
  ProtectedRoundRequest,
} from 'waldur-js-client';

import { parseDate } from '@waldur/core/dateUtils';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';
import {
  domainsToText,
  textToDomains,
  WizardFormFirstPage,
} from '@waldur/proposals/update/rounds/WizardFormFirstPage';
import { getRoundInitialValues } from '@waldur/proposals/utils';

interface EditRoundSubmissionDialogProps {
  resolve: {
    round: ProtectedRound;
    call: Call;
    refetch(): void;
  };
}

const validate = (values: ProtectedRoundRequest) => {
  const errors: any = {};
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const EditRoundSubmissionDialog: FC<EditRoundSubmissionDialogProps> = (
  props,
) => {
  const initialValues = useMemo(
    () => getRoundInitialValues(props.resolve.round),
    [props.resolve],
  );
  const dispatch = useDispatch();
  const submit = useCallback(
    (formData: any, _dispatch, formProps) => {
      return proposalProtectedCallsRoundsUpdate({
        path: {
          uuid: props.resolve.call.uuid,
          obj_uuid: props.resolve.round.uuid,
        },
        body: {
          ...initialValues,
          ...formData,
          default_allowed_domains: textToDomains(formData.default_allowed_domains ?? ''),
          default_reapply_url: formData.default_reapply_url || null,
          default_reapply_text: formData.default_reapply_text || null,
        },
      }).then(() => {
        formProps.destroy();
        dispatch(closeModalDialog());
        props.resolve.refetch();
      });
    },
    [dispatch, props.resolve, initialValues],
  );

  return (
    <WizardFormContainer
      form="RoundEditForm"
      title={translate('Edit round submission')}
      submitLabel={translate('Edit')}
      onSubmit={submit}
      steps={[
        { key: 'submission', label: translate('Submission'), completed: false },
      ]}
      wizardForms={[WizardFormFirstPage]}
      initialValues={{
        timezone: DateTime.local().zoneName,
        start_time: initialValues.start_time,
        cutoff_time: initialValues.cutoff_time,
        minimum_required_uploads: initialValues.minimum_required_uploads ?? 0,
        default_membership_control: initialValues.default_membership_control ?? 'open',
        default_allowed_domains: domainsToText(initialValues.default_allowed_domains),
        default_reapply_url: initialValues.default_reapply_url ?? '',
        default_reapply_text: initialValues.default_reapply_text ?? '',
      }}
      validate={validate}
    />
  );
};
