import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getUser } from '@waldur/workspace/selectors';

export const OrganizationNameField = ({
  row,
  label = null,
  onClick = undefined,
  className = undefined,
  asButton = false,
}) => {
  const user = useSelector(getUser);
  const hasOrganizationPermission = useMemo(
    () =>
      user.permissions.find(
        (permission) =>
          permission.scope_type === 'customer' &&
          permission.scope_uuid === row.uuid,
      ),
    [user, row],
  );
  const hasProjectPermission = useMemo(
    () =>
      user.permissions.find(
        (permission) =>
          permission.scope_type === 'project' &&
          permission.customer_uuid === row.uuid,
      ),
    [user, row],
  );
  return hasOrganizationPermission || user.is_staff || user.is_support ? (
    <Link
      state="organization.dashboard"
      params={{ uuid: row.uuid }}
      label={label || row.name}
      onClick={onClick}
      className={className}
    />
  ) : hasProjectPermission ? (
    <Link
      state="marketplace-projects"
      params={{ uuid: row.uuid }}
      label={label || row.name}
      onClick={onClick}
      className={className}
    />
  ) : asButton ? (
    <button type="button" className={className} disabled>
      {label || row.name}
    </button>
  ) : (
    <>{label || row.name}</>
  );
};
