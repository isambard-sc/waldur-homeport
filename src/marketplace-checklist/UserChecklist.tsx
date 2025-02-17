import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import {
  LoadingSpinner,
  LoadingSpinnerIcon,
} from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getUser } from '@waldur/workspace/selectors';

import { AnswersSummary } from './AnswersSummary';
import { AnswersTable } from './AnswersTable';
import { useUserChecklist } from './useChecklist';

const SubmitButton = ({ submitting, submit }) => (
  <Button onClick={() => submit()} variant="primary" disabled={submitting}>
    {submitting && (
      <>
        <LoadingSpinnerIcon />{' '}
      </>
    )}
    {translate('Submit')}
  </Button>
);

interface UserChecklistProps {
  userId?: string;
  readOnly?: boolean;
}

export const UserChecklist: React.FC<UserChecklistProps> = (props) => {
  const {
    params: { category },
  } = useCurrentStateAndParams();

  const user = useSelector(getUser);
  const state = useUserChecklist(props.userId || user.uuid, category);
  useTitle(state.categoryInfo?.name);

  if (state.checklistLoading) {
    return <LoadingSpinner />;
  } else if (state.checklistErred) {
    return <>{translate('Unable to load checklists.')}</>;
  } else if (state.checklistOptions) {
    if (!state.checklist) {
      return <>{translate('There are no checklist yet.')}</>;
    }
    return (
      <>
        <Select
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={state.checklist}
          onChange={state.setChecklist}
          options={state.checklistOptions}
          isClearable={false}
        />
        {state.questionsLoading ? (
          <LoadingSpinner />
        ) : state.questionsErred ? (
          <>{translate('Unable to load questions and answers.')}</>
        ) : (
          <>
            <AnswersSummary
              questions={state.questionsList}
              answers={state.answers}
            />
            <AnswersTable
              questions={state.questionsList}
              answers={state.answersTable}
              setAnswers={state.setAnswersTable}
              readOnly={props.readOnly}
            />
            {!props.readOnly && (
              <p>
                <SubmitButton
                  submit={state.submit}
                  submitting={state.submitting}
                />
              </p>
            )}
          </>
        )}
      </>
    );
  } else {
    return null;
  }
};
