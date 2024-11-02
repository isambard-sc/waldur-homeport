import { FC, PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

interface ProviderLinkProps {
  customer_uuid: string;
  className?: string;
}

export const ProviderLink: FC<PropsWithChildren<ProviderLinkProps>> = ({
  customer_uuid,
  className,
  children,
}) => {
  const workspace = useSelector(getWorkspace);

  return (
    <Link
      state={
        workspace === WorkspaceType.ORGANIZATION
          ? 'marketplace-provider-details-customer'
          : 'marketplace-provider-details'
      }
      params={{ customer_uuid }}
      className={className}
    >
      {children}
    </Link>
  );
};
