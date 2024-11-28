import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, PropsWithChildren } from 'react';

import { Link } from '@waldur/core/Link';

interface ProviderLinkProps {
  customer_uuid: string;
  className?: string;
}

export const ProviderLink: FC<PropsWithChildren<ProviderLinkProps>> = ({
  customer_uuid,
  className,
  children,
}) => {
  const { state } = useCurrentStateAndParams();
  return (
    <Link
      state={
        state.parent === 'organization'
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
