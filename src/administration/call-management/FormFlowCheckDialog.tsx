import { useQuery } from '@tanstack/react-query';
import { FormFlow, formFlowsCheck } from 'waldur-js-client';

import { AlertItem, Badge, CopyButton } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface FormFlowCheckDialogProps {
  resolve: { flow: FormFlow };
}

/**
 * Checks a flow against Formbricks: that each step's survey exists, declares
 * the hidden fields Waldur fills in, and has every question the step maps.
 *
 * Also gives each step's ending URL, which is what to set as that survey's
 * "Redirect to URL" so applicants come back to Waldur when they finish it.
 */
export const FormFlowCheckDialog = ({
  resolve: { flow },
}: FormFlowCheckDialogProps) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['FormFlowCheck', flow.uuid],
    queryFn: () =>
      formFlowsCheck({ path: { uuid: flow.uuid } }).then(
        (response) => response.data,
      ),
    // A check is a question asked now: never answer it from a cache.
    gcTime: 0,
    meta: { skipGlobalErrorRedirect: true },
  });

  return (
    <ModalDialog
      title={translate('Check {flow} against Formbricks', { flow: flow.name })}
      footer={<CloseDialogButton label={translate('Close')} />}
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
            variant={data.ok ? 'success' : 'warning'}
            title={
              data.ok
                ? translate('Every survey is ready for this flow.')
                : translate(
                    'Some surveys need changes before applicants use them.',
                  )
            }
          />
          <ol className="list-unstyled mb-0">
            {data.steps.map((step) => (
              <li key={step.key} className="border rounded p-4 mb-3">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <span className="fw-semibold">{step.key}</span>
                  {step.ok ? (
                    <Badge variant="success" shape="pill">
                      {translate('Ready')}
                    </Badge>
                  ) : (
                    <Badge variant="danger" shape="pill">
                      {translate('Needs changes')}
                    </Badge>
                  )}
                </div>
                <div className="text-muted fs-7 mb-2">
                  {translate('Survey {id}', { id: step.survey_id })}
                </div>
                {step.problems.length > 0 && (
                  <ul className="text-danger mb-3">
                    {step.problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                )}
                <div className="fs-7 text-muted mb-1">
                  {translate('Set as the survey ending ("Redirect to URL"):')}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <code className="text-break flex-grow-1">
                    {step.ending_url}
                  </code>
                  <CopyButton
                    value={step.ending_url}
                    label={translate('Copy')}
                    copiedLabel={translate('Copied')}
                  />
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </ModalDialog>
  );
};
