import { useEffect, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { change, Field, formValueSelector, isSubmitting } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InputGroup } from '@waldur/customer/create/InputGroup';
import { SelectField, TextField } from '@waldur/form';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { getTemplates, IssueTemplate } from '../api';
import { ISSUE_IDS } from '../types/constants';

import { AttachmentsGroup } from './AttachmentsGroup';
import { AttachmentsList } from './AttachmentsList';
import { ISSUE_CREATION_FORM_ID } from './constants';
import { IssueTypeOption } from './types';

const selector = formValueSelector(ISSUE_CREATION_FORM_ID);

export const IssueDescriptionTab = () => {
  const dispatch = useDispatch();
  const submitting = useSelector(isSubmitting(ISSUE_CREATION_FORM_ID));

  const templateState = useAsync(getTemplates);

  const issueType = useSelector<RootState, IssueTypeOption>((state) =>
    selector(state, 'type'),
  );
  const issueTemplate = useSelector<RootState, IssueTemplate>((state) =>
    selector(state, 'template'),
  );

  const filteredTemplates = useMemo(
    () =>
      templateState.value && issueType
        ? templateState.value.filter(
            (option) => ISSUE_IDS[option.issue_type] === issueType.id,
          )
        : [],
    [templateState.value, issueType],
  );

  useEffect(() => {
    if (issueTemplate) {
      dispatch(change(ISSUE_CREATION_FORM_ID, 'summary', issueTemplate.name));
      dispatch(
        change(
          ISSUE_CREATION_FORM_ID,
          'description',
          issueTemplate.description,
        ),
      );
    }
  }, [issueTemplate, dispatch]);

  useEffect(() => {
    if (filteredTemplates.length == 0 && issueTemplate) {
      dispatch(change(ISSUE_CREATION_FORM_ID, 'template', undefined));
      dispatch(change(ISSUE_CREATION_FORM_ID, 'summary', ''));
      dispatch(change(ISSUE_CREATION_FORM_ID, 'description', ''));
    }
  }, [filteredTemplates, issueTemplate, dispatch]);

  const templateFiles = issueTemplate ? issueTemplate.attachments : [];

  return templateState.loading ? (
    <LoadingSpinner />
  ) : templateState.error ? (
    <>{translate('Unable to load data.')}</>
  ) : (
    <>
      {filteredTemplates.length > 0 && (
        <Form.Group className="mb-5">
          <Form.Label>{translate('Template')}</Form.Label>
          <Field
            name="template"
            component={SelectField}
            placeholder={translate('Select issue template...')}
            options={filteredTemplates}
            isDisabled={submitting}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            isClearable={true}
          />
        </Form.Group>
      )}
      <Form.Group className="mb-5">
        <InputGroup
          name="summary"
          type="text"
          component={InputField}
          required={true}
          label={translate('Title')}
          disabled={submitting}
        />
      </Form.Group>
      <Form.Group className="mb-5">
        <InputGroup
          name="description"
          component={TextField}
          required={true}
          label={translate('Request description')}
          rows={3}
          disabled={submitting}
        />
      </Form.Group>
      {templateFiles.length > 0 && (
        <Form.Group className="mb-5">
          <Form.Label>{translate('Template files')}</Form.Label>
          <AttachmentsList attachments={templateFiles} />
        </Form.Group>
      )}
      <AttachmentsGroup />
    </>
  );
};
