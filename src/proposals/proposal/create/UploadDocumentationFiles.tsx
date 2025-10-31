import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { proposalProposalsAttachDocument } from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { ACCEPTED_FILE_TYPES } from '@waldur/core/constants';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { DocumentationFiles } from './DocumentationFiles';

export const UploadDocumentationFiles = (props) => {
  const dispatch = useDispatch();

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      // Update the form field to show the files as pending
      props.input.onChange(files);

      // Automatically upload each file
      try {
        await Promise.all(
          Array.from(files).map((file) =>
            proposalProposalsAttachDocument({
              path: { uuid: props.proposal.uuid },
              body: { file },
              ...formDataOptions,
            }),
          ),
        );

        // Clear the pending files after successful upload
        props.input.onChange({});

        // Refresh the proposal data to show newly uploaded files
        if (props.refetch) {
          await props.refetch();
        }

        dispatch(
          showSuccess(
            translate('File(s) uploaded successfully'),
          ),
        );
      } catch (error) {
        // Clear pending files on error
        props.input.onChange({});
        dispatch(
          showErrorResponse(error, translate('Failed to upload file(s)')),
        );
      }
    },
    [props.proposal.uuid, props.input, props.refetch, dispatch],
  );

  return (
    <>
      <UploadContainer
        onDrop={handleFileDrop}
        message={
          'PDF, PNG/JPG/JPEG, DOC/DOCX/ODT (' +
          translate('max. {size}', { size: '25 MB' }) +
          ')'
        }
        multiple={true}
        maxSize={25 * 1024 * 1024} // 25MB
        accept={ACCEPTED_FILE_TYPES}
      />

      <DocumentationFiles
        files={props.proposal.supporting_documentation}
        pending={props.input.value}
        onChange={props.input.onChange}
      />
    </>
  );
};
