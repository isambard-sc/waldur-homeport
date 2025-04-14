import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { PlanUsageResponse } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const PlanUsageDialog = lazyComponent(() =>
  import('./PlanUsageDialog').then((module) => ({
    default: module.PlanUsageDialog,
  })),
);

export const PlanUsageButton: FunctionComponent<{ row: PlanUsageResponse }> = (
  props,
) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Show chart')}
      disabled={props.row.limit === null}
      tooltip={
        props.row.limit === null ? translate('Plan does not have limit') : ''
      }
      action={() =>
        dispatch(
          openModalDialog(PlanUsageDialog, {
            resolve: { row: props.row },
          }),
        )
      }
    />
  );
};
