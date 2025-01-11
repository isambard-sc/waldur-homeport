import { File as FileIcon } from '@phosphor-icons/react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, isSubmitting } from 'redux-form';

import '@waldur/form/upload/AttachmentItem.scss';
import { formatFilesize } from '@waldur/core/utils';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';

import { ISSUE_CREATION_FORM_ID } from './constants';

export const AttachmentsGroup = () => {
  const submitting = useSelector(isSubmitting(ISSUE_CREATION_FORM_ID));

  return (
    <Form.Group className="mb-5">
      <Form.Label>{translate('Attachments')}</Form.Label>
      <Field
        name="files"
        component={({ input: { value, onChange } }) => (
          <>
            <UploadContainer
              onDrop={onChange}
              disabled={submitting}
              message={translate('SVG, PNG, JPG or GIF (max. 800x400px)')}
            />
            {value.length > 0 ? (
              <ul className="attachment-list p-0 pt-4">
                {Array.from(value as FileList).map((file, index) => (
                  <div className="attachment-item" key={index}>
                    <div className="attachment-item__thumb">
                      <FileIcon size={40} className="text-muted" />
                    </div>
                    <div className="attachment-item__body">
                      <h6 className="fw-bold text-gray-700 mb-0">
                        {file.name}
                      </h6>
                      <p className="fs-6 text-muted mb-0">
                        {formatFilesize(file.size, 'B')}
                      </p>
                    </div>
                  </div>
                ))}
              </ul>
            ) : null}
          </>
        )}
      />
    </Form.Group>
  );
};
