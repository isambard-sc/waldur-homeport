import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FormFlow,
  FormFlowCheck,
  formFlowsCheckRetrieve,
  formFlowsSync,
} from 'waldur-js-client';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { isStaff } from '@/workspace/selectors';

interface FormFlowCheckDialogProps {
  resolve: { flow: FormFlow };
}

const checkQueryKey = (flowUuid: string) => ['FormFlowCheck', flowUuid];

const StepCheck = ({ step }: { step: FormFlowCheck['steps'][number] }) => (
  <li className="border rounded p-4 mb-3">
    <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
      <span className="fw-semibold">{step.survey_name || step.key}</span>
      {step.in_sync ? (
        <Badge variant="success" shape="pill">
          {translate('In sync')}
        </Badge>
      ) : step.problems.length ? (
        <Badge variant="danger" shape="pill">
          {translate('Needs fixing in Formbricks')}
        </Badge>
      ) : (
        <Badge variant="warning" shape="pill">
          {translate('Needs a sync')}
        </Badge>
      )}
    </div>
    <div className="text-muted fs-7 mb-3">
      {translate('Step {key} · survey {id}', {
        key: step.key,
        id: step.survey_id,
      })}
    </div>
    {step.changes.length > 0 && (
      <>
        <div className="fs-7 fw-semibold">{translate('Sync would change')}</div>
        <ul className="mb-3">
          {step.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </>
    )}
    {step.problems.length > 0 && (
      <>
        <div className="fs-7 fw-semibold text-danger">
          {translate('To fix in Formbricks')}
        </div>
        <ul className="text-danger mb-3">
          {step.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      </>
    )}
    {step.questions.length > 0 && (
      <details>
        <summary className="fs-7 text-muted">
          {translate('{count} questions', { count: step.questions.length })}
        </summary>
        <ol className="fs-7 mt-2 mb-0">
          {step.questions.map((question) => (
            <li key={question.id}>
              {question.label}{' '}
              <span className="text-muted">({question.type})</span>
              {question.choices.length > 0 && (
                <span className="text-muted">
                  {' '}
                  — {question.choices.join(', ')}
                </span>
              )}
            </li>
          ))}
        </ol>
      </details>
    )}
  </li>
);

/**
 * Checks a flow's surveys against Formbricks: what Sync would set up in
 * each survey (its hidden fields and ending, which bring applicants back),
 * and what only Formbricks can fix. Staff can sync from here, after seeing
 * the changes it will make.
 */
export const FormFlowCheckDialog = ({
  resolve: { flow },
}: FormFlowCheckDialogProps) => {
  const canSync = useSelector(isStaff);
  const queryClient = useQueryClient();
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [syncing, setSyncing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: checkQueryKey(flow.uuid),
    queryFn: () =>
      formFlowsCheckRetrieve({ path: { uuid: flow.uuid } }).then(
        (response) => response.data,
      ),
    // A check is a question asked now: never answer it from a cache.
    gcTime: 0,
    meta: { skipGlobalErrorRedirect: true },
  });

  const changes = data?.steps.flatMap((step) =>
    step.changes.map((change) => `${step.survey_name || step.key}: ${change}`),
  );

  const sync = async () => {
    try {
      await confirm(
        translate('Sync surveys'),
        <>
          <p>{translate('These changes will be made in Formbricks:')}</p>
          <ul className="mb-0">
            {changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </>,
        { positiveButton: translate('Sync') },
      );
    } catch {
      return;
    }
    setSyncing(true);
    try {
      const { data: result } = await formFlowsSync({
        path: { uuid: flow.uuid },
      });
      queryClient.setQueryData(checkQueryKey(flow.uuid), result);
      showSuccess(translate('The surveys have been synced.'));
    } catch (e) {
      showErrorResponse(e, translate('Unable to sync the surveys.'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ModalDialog
      title={translate('Check {flow} against Formbricks', { flow: flow.name })}
      footer={
        <>
          <CloseDialogButton label={translate('Close')} />
          {canSync && data && (
            <BaseButton
              variant="primary"
              label={translate('Sync surveys')}
              onClick={sync}
              pending={syncing}
              disabled={!changes?.length}
              disabledReason={translate('There is nothing to sync.')}
            />
          )}
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to check the flow against Formbricks.')}
          loadData={refetch}
        />
      ) : (
        <>
          <AlertItem
            className="mb-5"
            variant={data.in_sync ? 'success' : 'warning'}
            title={
              data.in_sync
                ? translate('Every survey is ready for this flow.')
                : changes.length
                  ? translate(
                      'Some surveys need a sync before applicants use them.',
                    )
                  : translate(
                      'Some surveys need changes in Formbricks before applicants use them.',
                    )
            }
          />
          <ol className="list-unstyled mb-0">
            {data.steps.map((step) => (
              <StepCheck key={step.key} step={step} />
            ))}
          </ol>
        </>
      )}
    </ModalDialog>
  );
};
