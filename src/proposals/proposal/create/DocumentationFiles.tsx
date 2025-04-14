import { ProposalDocumentation } from 'waldur-js-client';

import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';

interface DocumentationFilesProps {
  files: Array<ProposalDocumentation>;
  pending?: FileList;
  onChange?(value): void;
}

export const DocumentationFiles = (props: DocumentationFilesProps) =>
  props.files?.length > 0 || props.pending?.length > 0 ? (
    <AttachmentsList
      attachments={
        props.files &&
        (props.files.map((file) => ({
          key: file.file,
          ...file,
          // Extract the file name from a given file path
          file_name: file.file_name
            .split('/')
            .pop()
            .replace(/_[^_]+\./, '.'),
        })) as any)
      }
      uploading={
        props.pending &&
        Array.from(props.pending).map((file) => ({
          key: file.size,
          file,
        }))
      }
      ItemPendingComponent={(itemProps) => (
        <AttachmentItemPending
          {...itemProps}
          onCancel={(f) =>
            props.onChange(
              Array.from(props.pending).filter(
                (file) => file.name !== f.name && file.size !== f.size,
              ),
            )
          }
        />
      )}
      className="mb-3"
    />
  ) : null;
