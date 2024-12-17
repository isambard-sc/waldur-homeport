import { formatDateTime } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { FileDownloader } from './FileDownloader';
import { ImageFetcher } from './ImageFetcher';
import { Attachment } from './types';

export const AttachmentModal = ({
  resolve: { attachment },
}: {
  resolve: { attachment: Attachment };
}) => (
  <MetronicModalDialog
    title={attachment.file_name}
    subtitle={
      formatFilesize(attachment.file_size, 'B') +
      ' - ' +
      formatDateTime(attachment.created)
    }
    actions={
      <FileDownloader
        url={attachment.file}
        name={attachment.file_name}
        size={30}
      />
    }
    closeButton
  >
    <ImageFetcher url={attachment.file} name={attachment.file_name} />
  </MetronicModalDialog>
);
