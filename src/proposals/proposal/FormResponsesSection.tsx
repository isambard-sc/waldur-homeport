import { Fragment } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FormResponseGroup } from '@waldur/proposals/formbricksApi';

export const STEP_LABELS: Record<string, string> = {
  project_details: translate('Project details'),
  team_details: translate('Team details'),
  compliance: translate('Compliance'),
  assessment: translate('Assessment'),
};

const formatAnswer = (answer: unknown): string => {
  if (Array.isArray(answer)) {
    return answer.length ? answer.join(', ') : '—';
  }
  if (answer === null || answer === undefined || answer === '') {
    return '—';
  }
  return String(answer);
};

interface FormResponsesSectionProps {
  formResponses?: FormResponseGroup[] | null;
  className?: string;
}

/** Read-only rendering of a proposal's stored Formbricks answers - used on
 * the draft-stage progress page, the post-submission proposal detail view,
 * and the reviewer page. Each caller passes whichever steps it's allowed to
 * see (already filtered server-side); renders nothing if there's nothing to
 * show, e.g. for calls that don't use the Formbricks flow at all. */
export const FormResponsesSection = ({
  formResponses,
  className,
}: FormResponsesSectionProps) => {
  if (!formResponses?.length) {
    return null;
  }

  return (
    <FormTable.Card
      title={translate('Application form responses')}
      className={className ?? 'card-bordered mb-7'}
    >
      <FormTable detailsMode>
        {formResponses.map((step) => (
          <Fragment key={step.step_key}>
            <tr className="gray-bg">
              <th colSpan={2}>{STEP_LABELS[step.step_key] ?? step.step_key}</th>
            </tr>
            {step.questions.map((question) => (
              <FormTable.Item
                key={question.question_id}
                label={question.label}
                value={formatAnswer(question.answer)}
              />
            ))}
          </Fragment>
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
