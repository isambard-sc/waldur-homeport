import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import Markdown from 'markdown-to-jsx';
import { useMemo, useCallback, FunctionComponent } from 'react';
import { Card, Accordion } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { TemplateQuestions } from '@waldur/rancher/template/TemplateQuestions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { type RootState } from '@waldur/store/reducers';

import { createApp } from '../api';

import { FORM_ID } from './constants';
import { TemplateHeader } from './TemplateHeader';
import { FormData } from './types';
import { serializeApplication, parseVisibleQuestions, loadData } from './utils';

export const TemplateDetail: FunctionComponent = () => {
  const {
    params: { templateUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const router = useRouter();

  const state = useAsync(
    () => loadData(templateUuid, clusterUuid),
    [templateUuid, clusterUuid],
  );

  useTitle(
    state.value ? state.value.template.name : translate('Template details'),
  );

  const project = useSelector((state: RootState) =>
    formValueSelector(FORM_ID)(state, 'project'),
  );

  const namespaces = useMemo(() => project?.namespaces || [], [project]);

  const answers = useSelector((state: RootState) =>
    formValueSelector(FORM_ID)(state, 'answers'),
  );

  const questions = state.value?.questions;

  const visibleQuestions = useMemo(
    () => parseVisibleQuestions(questions, answers),
    [questions, answers],
  );

  const dispatch = useDispatch();

  const createApplication = useCallback(
    async (formData: FormData) => {
      try {
        await createApp(
          serializeApplication(
            formData,
            state.value.template,
            state.value.cluster.service_settings,
            state.value.cluster.project,
            visibleQuestions,
          ),
        );
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to create application.'),
          ),
        );
        return;
      }
      dispatch(showSuccess(translate('Application has been created.')));
    },
    [dispatch, router.stateService, clusterUuid, state.value, visibleQuestions],
  );

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load application template details.')}</h3>;
  }

  if (!state.value) {
    return null;
  }

  return (
    <>
      <TemplateHeader {...state.value} />

      <Accordion
        id="application-template-form"
        defaultActiveKey="configuration"
      >
        {state.value.version.readme && (
          <Accordion.Item eventKey="readme">
            <Card.Header>
              <Card.Title>{translate('Summary')}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Markdown>{state.value.version.readme}</Markdown>
            </Card.Body>
          </Accordion.Item>
        )}
        <Accordion.Item eventKey="configuration">
          <Card.Header>
            <Card.Title>{translate('Configuration')}</Card.Title>
          </Card.Header>
          <Card.Body>
            <TemplateQuestions
              questions={visibleQuestions}
              versions={state.value.template.versions}
              projects={state.value.projects}
              namespaces={namespaces}
              initialValues={state.value.initialValues}
              createApplication={createApplication}
            />
          </Card.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};
