import { FC } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import {
  deleteReportingFile,
  ReportingFileListItem,
} from './reportingFilesApi';

interface ReportingFileDeleteActionProps {
  row: ReportingFileListItem;
  refetch: () => void | Promise<void>;
}

// Files are also deleted automatically after
// AI_REPORTING_FILE_RETENTION_DAYS; this lets a user do it sooner.
export const ReportingFileDeleteAction: FC<ReportingFileDeleteActionProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<void, unknown, void>({
    mutationFn: () => deleteReportingFile(row.uuid).then(() => undefined),
    successMessage: translate('File has been deleted.'),
    errorMessage: translate('Unable to delete file.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete "{name}"?', {
        name: row.name,
      }),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
