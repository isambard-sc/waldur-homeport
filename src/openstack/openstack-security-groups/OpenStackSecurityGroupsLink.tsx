import { Question } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { useModal } from '@waldur/modal/hooks';

const OpenStackSecurityGroupsDialog = lazyComponent(
  () => import('./OpenStackSecurityGroupsDialog'),
  'OpenStackSecurityGroupsDialog',
);

export const OpenStackSecurityGroupsLink = ({ items }) => {
  const { openDialog } = useModal();

  const handleOpenDialog = () => {
    openDialog(OpenStackSecurityGroupsDialog, {
      resolve: { securityGroups: items },
      size: 'lg',
    });
  };

  if (!items?.length) {
    return <>&mdash;</>;
  }

  return (
    <button className="btn btn-link btn-flush" onClick={handleOpenDialog}>
      {items.map((item) => item.name).join(', ')}
      <Question size={17} className="ms-1" />
    </button>
  );
};
