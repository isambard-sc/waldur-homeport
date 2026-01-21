import { FileXlsIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ReviewsExportDialog = lazyComponent(() =>
  import('./ReviewsExportDialog').then((module) => ({
    default: module.ReviewsExportDialog,
  })),
);

interface ReviewsExportButtonProps {
  roundUuid: string;
  callUuid: string;
  roundName?: string;
}

export const ReviewsExportButton: FC<ReviewsExportButtonProps> = ({
  roundUuid,
  callUuid,
  roundName,
}) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(ReviewsExportDialog, {
        resolve: { roundUuid, callUuid, roundName },
        size: 'md',
      }),
    );
  };

  return (
    <Button variant="light" size="sm" onClick={handleClick}>
      <span className="svg-icon svg-icon-2">
        <FileXlsIcon weight="bold" />
      </span>
      {translate('Export to Excel')}
    </Button>
  );
};
