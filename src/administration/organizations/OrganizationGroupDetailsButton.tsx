import { Eye } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const OrganizationGroupDetailsDialog = lazyComponent(() =>
  import('./OrganizationGroupDetailsDialog').then((module) => ({
    default: module.OrganizationGroupDetailsDialog,
  })),
);

interface OrganizationGroupDetailsButtonProps {
  row: OrganizationGroup;
}

const openOrganizationGroupsDialog = (row: OrganizationGroup) => {
  return openModalDialog(OrganizationGroupDetailsDialog, {
    resolve: { organizationGroup: row },
    size: 'xl',
  });
};

export const OrganizationGroupDetailsButton: FunctionComponent<
  OrganizationGroupDetailsButtonProps
> = (props) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Details')}
      iconNode={<Eye />}
      action={() => dispatch(openOrganizationGroupsDialog(props.row))}
      size="sm"
    />
  );
};
