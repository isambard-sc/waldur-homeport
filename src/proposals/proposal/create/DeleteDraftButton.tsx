import { TrashIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useState } from 'react';
import { proposalProposalsDestroy } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { requestListState, usesCallVocabulary } from '@/proposals/presentation';
import { useNotify } from '@/store/notify';

interface DeleteDraftButtonProps {
  proposalUuid: string;
  /** Whether the call asks for forms, whose answers go with the draft. */
  hasForms?: boolean;
  disabled?: boolean;
}

/**
 * Deletes a draft the applicant no longer wants: its creator and managers
 * may, as they may submit it. Leaves for the applicant's list afterwards.
 */
export const DeleteDraftButton: FC<DeleteDraftButtonProps> = ({
  proposalUuid,
  hasForms,
  disabled,
}) => {
  const router = useRouter();
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [deleting, setDeleting] = useState(false);

  const deleteDraft = async () => {
    const question = usesCallVocabulary()
      ? translate('Are you sure you want to delete this draft proposal?')
      : translate('Are you sure you want to delete this draft access request?');
    try {
      await confirm(
        translate('Delete draft'),
        hasForms
          ? `${question} ${translate('Your answers to its forms will be deleted too.')}`
          : question,
        { forDeletion: true, positiveButton: translate('Delete') },
      );
    } catch {
      return;
    }
    setDeleting(true);
    try {
      await proposalProposalsDestroy({ path: { uuid: proposalUuid } });
      showSuccess(translate('The draft has been deleted.'));
      router.stateService.go(requestListState());
    } catch (error) {
      showErrorResponse(error, translate('Unable to delete the draft.'));
      setDeleting(false);
    }
  };

  return (
    <BaseButton
      onClick={deleteDraft}
      label={translate('Delete draft')}
      iconNode={<TrashIcon weight="bold" />}
      variant="text-danger"
      className="w-100 mt-2"
      pending={deleting}
      disabled={disabled}
      disabledReason={translate('Wait for the current action to finish.')}
    />
  );
};
