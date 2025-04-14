import { FC, PropsWithChildren, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getUser } from '@waldur/workspace/selectors';

interface OwnProps {
  uuid: string;
  className?: string;
  onClick?(): void;
  asButton?: boolean;
}

export const OrganizationLink: FC<PropsWithChildren<OwnProps>> = ({
  uuid,
  onClick,
  className,
  asButton,
  children,
}) => {
  const user = useSelector(getUser);
  const hasOrganizationPermission = useMemo(
    () =>
      user.permissions.find(
        (permission) =>
          permission.scope_type === 'customer' &&
          permission.scope_uuid === uuid,
      ),
    [user, uuid],
  );
  const hasProjectPermission = useMemo(
    () =>
      user.permissions.find(
        (permission) =>
          permission.scope_type === 'project' &&
          permission.customer_uuid === uuid,
      ),
    [user, uuid],
  );
  return hasOrganizationPermission || user.is_staff || user.is_support ? (
    <Link
      state="organization.dashboard"
      params={{ uuid }}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  ) : hasProjectPermission ? (
    <Link
      state="marketplace-projects"
      params={{ uuid }}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  ) : asButton ? (
    <button type="button" className={className} disabled>
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  );
};
