import {
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  CircleIcon,
} from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { ProposalForm, proposalFormsLink } from 'waldur-js-client';

import { AlertItem, BaseButton, Menu } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { fetchProposalForm } from './proposalForms';

interface ProposalFormsCardProps {
  proposalUuid: string;
  form: ProposalForm;
}

/**
 * The extra forms a call's form flow asks for, beside Waldur's own proposal
 * form: compliance, team details and the like, each a Formbricks survey.
 *
 * Each button asks the backend for a single-use link and leaves for it in
 * this tab; the survey ends back on the proposal page. A link is never kept:
 * the backend reuses an open one, so a half-done form resumes, and for an
 * answered one gives a new link prefilled with the answers.
 */
export const ProposalFormsCard: FC<ProposalFormsCardProps> = ({
  proposalUuid,
  form,
}) => {
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();
  const [openingStep, setOpeningStep] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const openForm = async (step: string) => {
    setOpeningStep(step);
    try {
      const { data } = await proposalFormsLink({
        path: { uuid: proposalUuid },
        body: { step },
      });
      window.location.assign(data.survey_url);
    } catch (error) {
      showErrorResponse(error, translate('Unable to open the form.'));
      setOpeningStep(null);
    }
  };

  const fetchResponses = async () => {
    setFetching(true);
    try {
      const fetched = await fetchProposalForm(queryClient, proposalUuid);
      showSuccess(
        fetched
          ? translate('Fetched {count} answers from Formbricks.', {
              count: fetched,
            })
          : translate('Your answers are up to date.'),
      );
    } catch (error) {
      showErrorResponse(error, translate('Unable to fetch your form answers.'));
    } finally {
      setFetching(false);
    }
  };

  return (
    <Panel
      title={translate('Forms')}
      subtitle={translate(
        'This call asks for these forms as well. Submitting is possible once every one is answered.',
      )}
      cardBordered
      className="mb-7"
      actions={
        form.can_fill_in ? (
          <ActionsMenu side="bottom" align="end">
            <Menu.Item
              icon={<ArrowsClockwiseIcon weight="bold" />}
              disabled={fetching}
              onSelect={fetchResponses}
            >
              {translate('Fetch responses')}
            </Menu.Item>
          </ActionsMenu>
        ) : null
      }
    >
      {!form.available && (
        <AlertItem
          variant="warning"
          className="mb-5"
          title={translate('The forms cannot be opened just now')}
          body={
            form.missing.length
              ? translate(
                  'Your answers so far are kept. Submitting waits until the remaining forms are answered: please try again later, or contact the call managers if it keeps happening.',
                )
              : translate(
                  'Your answers are kept, and every form is answered, so you can still submit.',
                )
          }
        />
      )}
      <ul className="list-unstyled mb-0" aria-label={translate('Forms')}>
        {form.steps.map((step) => (
          <li
            key={step.key}
            className="d-flex justify-content-between align-items-center gap-3 py-3 border-bottom"
          >
            <div className="d-flex align-items-start gap-2">
              {step.completed ? (
                <CheckCircleIcon
                  size={20}
                  weight="fill"
                  className="text-success flex-shrink-0"
                  aria-label={translate('Answered')}
                />
              ) : (
                <CircleIcon
                  size={20}
                  weight="bold"
                  className="text-muted flex-shrink-0"
                  aria-label={translate('Not answered yet')}
                />
              )}
              <div>
                <div className="fw-bold">{step.label}</div>
                {step.completed && step.submitted_at ? (
                  <div className="text-muted fs-7">
                    {translate('Answered {date}', {
                      date: formatDateTime(step.submitted_at),
                    })}
                  </div>
                ) : step.in_progress ? (
                  <div className="text-muted fs-7">
                    {translate('Started, not finished yet')}
                  </div>
                ) : null}
              </div>
            </div>
            {form.can_fill_in && (
              <BaseButton
                variant={step.completed ? 'tertiary' : 'primary'}
                size="sm"
                pending={openingStep === step.key}
                disabled={Boolean(openingStep) && openingStep !== step.key}
                disabledReason={
                  openingStep && openingStep !== step.key
                    ? translate('Opening another form…')
                    : undefined
                }
                onClick={() => openForm(step.key)}
                label={
                  step.completed
                    ? translate('Edit')
                    : step.in_progress
                      ? translate('Continue')
                      : translate('Fill in')
                }
                aria-label={
                  step.completed
                    ? translate('Edit {form}', { form: step.label })
                    : step.in_progress
                      ? translate('Continue {form}', { form: step.label })
                      : translate('Fill in {form}', { form: step.label })
                }
              />
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
};
