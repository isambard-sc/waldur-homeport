import { Link } from '@waldur/core/Link';

import { UserDetailsLink } from './UserDetailsLink';

export interface UserContext {
  user_uuid: string;
  user_full_name: string;
  user_username: string;
}

export interface AffectedUserContext {
  affected_user_uuid: string;
  affected_user_full_name: string;
  affected_user_username: string;
}

interface CustomerContext {
  customer_uuid: string;
  customer_name: string;
}

interface ProjectContext {
  project_uuid: string;
  project_name: string;
}

export const getUserContext = (event: UserContext) => ({
  user_link: (
    <UserDetailsLink
      uuid={event.user_uuid}
      name={event.user_full_name || event.user_username}
    />
  ),
});

export const getAffectedUserContext = (event: AffectedUserContext) => ({
  affected_user_link: (
    <UserDetailsLink
      uuid={event.affected_user_uuid}
      name={event.affected_user_full_name || event.affected_user_username}
    />
  ),
});

export const getCustomerContext = (event: CustomerContext) => ({
  customer_link: (
    <Link state="organization.events" params={{ uuid: event.customer_uuid }}>
      {event.customer_name}
    </Link>
  ),
});

export const getProjectContext = (event: ProjectContext) => ({
  project_link: (
    <Link state="project.dashboard" params={{ uuid: event.project_uuid }}>
      {event.project_name}
    </Link>
  ),
});

export const getCallerContext = (event) => ({
  caller_link: (
    <UserDetailsLink
      uuid={event.caller_uuid}
      name={event.caller_full_name || event.caller_username}
    />
  ),
});
