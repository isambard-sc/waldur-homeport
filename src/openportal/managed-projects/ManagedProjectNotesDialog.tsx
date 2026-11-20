import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  ManagedProject,
  openportalManagedProjectsRetrieveGet,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { ManagedProjectNotes } from './ManagedProjectNotes';

interface ManagedProjectNotesDialogProps {
  row: ManagedProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

/**
 * The notes on one award, opened from the list.
 *
 * Stays open after a note is added, and reloads the award so the note joins
 * the thread: a reviewer often writes more than one in a row. The list is
 * refreshed too, for its note count.
 */
export const ManagedProjectNotesDialog: React.FC<
  ManagedProjectNotesDialogProps
> = ({ row, resolve }) => {
  const { data: project = row, refetch } = useQuery({
    queryKey: ['ManagedProjectDetail', row.identifier, row.destination],
    queryFn: () =>
      openportalManagedProjectsRetrieveGet({
        path: { identifier: row.identifier, destination: row.destination },
      }).then((r) => r.data),
    initialData: row,
    // The list's copy is current when the dialog opens.
    staleTime: Infinity,
  });

  return (
    <ModalDialog
      title={translate('Notes — {name}', {
        name: project.details?.name || project.identifier,
      })}
      iconNode={<ChatTeardropTextIcon weight="bold" />}
      footer={<CloseDialogButton />}
    >
      <ManagedProjectNotes
        project={project}
        refetch={async () => {
          await Promise.all([refetch(), resolve.refetch()]);
        }}
      />
    </ModalDialog>
  );
};
