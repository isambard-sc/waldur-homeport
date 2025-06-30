import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import RequestedProject from './RequestedProject';
import { requestedProjectAccept, requestedProjectCancel } from './requestedProjectActions';

interface ProjectRequestItemActionsProps {
  row: RequestedProject;
  fetch;
}

export const ProjectRequestItemActions = ({
  row,
  fetch,
}: ProjectRequestItemActionsProps) => {
  const dispatch = useDispatch();
  const { mutate: accept, isPending: isAcceptLoading } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Accepting project request'),
          translate(
            'Are you sure you want to accept the {name} project request?',
            {
              name: <b>{row.name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await requestedProjectAccept({ path: { uuid: row.uuid } });
        fetch();
        dispatch(showSuccess(translate('Project request has been accepted.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to accept project request.'),
          ),
        );
      }
    },
  });
  const { mutate: reject, isPending: isRejectLoading } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Rejecting project request'),
          translate(
            'Are you sure you want to reject the {name} project request?',
            {
              name: <b>{row.name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await requestedProjectCancel({ path: { uuid: row.uuid } });
        fetch();
        dispatch(showSuccess(translate('Project has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to reject project request.'),
          ),
        );
      }
    },
  });
  return row.state === 'requested' ? (
    <>
      <RowActionButton
        action={accept}
        title={translate('Accept')}
        variant="light-primary"
        pending={isAcceptLoading || isRejectLoading}
        size="sm"
      />

      <RowActionButton
        action={reject}
        title={translate('Reject')}
        variant="light-danger"
        pending={isAcceptLoading || isRejectLoading}
        size="sm"
      />
    </>
  ) : null;
};
