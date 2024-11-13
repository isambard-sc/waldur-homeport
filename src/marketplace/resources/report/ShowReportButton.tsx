import { BookOpen } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Report } from '@waldur/marketplace/resources/types';
import { useModal } from '@waldur/modal/hooks';

const ShowReportDialog = lazyComponent(() =>
  import('./ShowReportDialog').then((module) => ({
    default: module.ShowReportDialog,
  })),
);

interface ShowReportButtonProps {
  report: Report;
}

export const ShowReportButton: React.FC<ShowReportButtonProps> = ({
  report,
}) => {
  const { openDialog } = useModal();
  if (!report) {
    return null;
  }
  return (
    <button
      className="btn btn-info pull-right btn-sm ms-2"
      onClick={() =>
        openDialog(ShowReportDialog, { resolve: { report }, size: 'lg' })
      }
    >
      <span className="svg-icon svg-icon-2">
        <BookOpen />
      </span>{' '}
      {translate('Show report')}
    </button>
  );
};
