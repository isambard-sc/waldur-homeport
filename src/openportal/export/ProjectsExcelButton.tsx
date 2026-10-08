import { MicrosoftExcelLogoIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { projectsList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { projectExportFilter } from './projectExportFilter';
import { ProjectsExcelDialog } from './ProjectsExcelDialog';

interface Props {
  /**
   * The table's current filter and search string. The export covers every page
   * matching them, so the contract is the same as the built-in Export: narrow
   * the list, then export what it shows.
   */
  filter: Record<string, any>;
  query?: string;
  queryField?: string;
}

export const ProjectsExcelButton: FC<Props> = ({
  filter,
  query,
  queryField,
}) => {
  const { openDialog } = useModal();

  const fetchProjects = useCallback(
    () =>
      getAllPages((page) =>
        projectsList({
          query: {
            ...projectExportFilter(filter, query, queryField),
            page,
            page_size: 200,
          },
        }),
      ),
    [filter, query, queryField],
  );

  return (
    <BaseButton
      label={translate('Excel')}
      iconNode={<MicrosoftExcelLogoIcon weight="bold" />}
      variant="secondary"
      size="lg"
      onClick={() =>
        openDialog(ProjectsExcelDialog, {
          resolve: {
            fetchProjects,
            scopeLabel: translate(
              'Exports every project matching the filters on this list. Narrow the list first to export fewer.',
            ),
            filename: 'projects',
          },
        })
      }
    />
  );
};
