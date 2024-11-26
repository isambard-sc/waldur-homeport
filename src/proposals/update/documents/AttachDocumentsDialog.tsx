import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FileField } from '@waldur/issues/create/FileField';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { attachDocuments } from '@waldur/proposals/update/documents/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface AttachDocumentsFormData {
  files: { file: File }[];
  description: string;
}

interface AttachDocumentsProps {
  resolve: { refetch; call };
}

export const AttachDocumentsDialog = reduxForm<
  AttachDocumentsFormData,
  AttachDocumentsProps
>({
  form: 'AttachDocumentsDialog',
})(({ resolve: { call, refetch }, submitting, handleSubmit }) => {
  const dispatch = useDispatch();

  const [files, setFiles] = useState([]);
  const handleFileChange = () => (event) => {
    const files = event.target.files;
    const fileNames = [];
    for (let i = 0; i < files.length; i++) {
      fileNames.push(files[i].name);
    }
    setFiles(fileNames);
  };

  const callback = async (formData: AttachDocumentsFormData) => {
    try {
      const files = Object.values(formData.files);
      const descriptions = files.map(
        (_, index) => formData[`description-${index}`] || '',
      );
      if (files.length) {
        await Promise.all(
          files.map((file, index) =>
            attachDocuments(call, file, descriptions[index]),
          ),
        );
      }
      refetch();
      dispatch(showSuccess(translate('Documents have been attached.')));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate(
            'An error occurred while attaching documents. Please try again.',
          ),
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(callback)}>
      <Modal.Header>
        <Modal.Title>{translate('Add call attachments')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={submitting}>
          <Field
            name="files"
            component={FileField}
            disabled={submitting}
            onChange={handleFileChange()}
          />
          {files.map((file, index) => (
            <Field
              key={index}
              name={`description-${index}`}
              component={StringField}
              label={translate('Description for {file}', { file })}
              required={false}
            />
          ))}
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton submitting={submitting} label={translate('Save')} />
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
