import { FC } from 'react';
import { ProposalDocumentation } from 'waldur-js-client';

import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';

interface DocumentationFilesProps {
  files: Array<ProposalDocumentation>;
  pending?: FileList;
  onChange?(value): void;
  onDelete?(file: ProposalDocumentation): void;
  isDraft?: boolean;
  deletingFileUrl?: string;
}

export const DocumentationFiles: FC<DocumentationFilesProps> = (props) =>
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
      ItemComponent={
        props.isDraft && props.onDelete
          ? (itemProps) => (
              <AttachmentItem
                {...itemProps}
                onDelete={() => props.onDelete(itemProps.attachment)}
                isDeleting={
                  props.deletingFileUrl === itemProps.attachment.file
                }
              />
            )
          : undefined
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
