import { Fragment } from 'react';
import { FormStepResponse } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

/**
 * An answer as the backend stores it: a string, a number, or a list for a
 * multiple-choice question. Typed loosely by the schema, hence unknown.
 */
export const formatAnswer = (answer: unknown): string | null => {
  if (Array.isArray(answer)) {
    return answer.length ? answer.join(', ') : null;
  }
  if (answer === null || answer === undefined || answer === '') {
    return null;
  }
  if (typeof answer === 'object') {
    return JSON.stringify(answer);
  }
  return String(answer);
};

interface FormResponsesSectionProps {
  responses?: FormStepResponse[] | null;
  className?: string;
  /** Defaults to "Form answers". */
  title?: string;
}

/**
 * A proposal's answers to its form flow, step by step, read-only.
 *
 * Used on the applicant's draft, the proposal page and the review
 * page. The backend has already narrowed the steps to what the viewer may
 * see (reviewers get only the reviewer-visible ones), so this shows all it is
 * given, and nothing at all when there is nothing to show.
 */
export const FormResponsesSection = ({
  responses,
  className,
  title,
}: FormResponsesSectionProps) => {
  if (!responses?.length) {
    return null;
  }

  return (
    <FormTable.Card
      title={title ?? translate('Form answers')}
      className={className ?? 'card-bordered mb-7'}
    >
      <FormTable detailsMode>
        {responses.map((step, index) => (
          <Fragment key={step.step_key}>
            <tr className="gray-bg">
              <th colSpan={2} className={index > 0 ? 'pt-5' : undefined}>
                <span className="fs-4 fw-bolder text-dark">
                  {step.step_label}
                </span>
                {step.submitted_at && (
                  <span className="text-muted fs-7 fw-normal ms-3">
                    {translate('Answered {date}', {
                      date: formatDateTime(step.submitted_at),
                    })}
                  </span>
                )}
              </th>
            </tr>
            {step.questions.map((question) => (
              <FormTable.Item
                key={question.question_id}
                label={question.label}
                value={renderFieldOrDash(formatAnswer(question.answer))}
              />
            ))}
          </Fragment>
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
