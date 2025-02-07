import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import {
  getProjectsCount,
  getResourcesCount,
} from '@waldur/administration/api';
import { Badge } from '@waldur/core/Badge';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getStates } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { Customer } from '@waldur/workspace/types';

import { TableTabsContainer } from '../../customer/list/TableTabsContainer';
import { getCustomerUsersCount } from '../../customer/team/api';

import { SummaryOrganizationProjects } from './SummaryOrganizationProjects';
import { SummaryResourcesTable } from './SummaryResourcesTable';
import { SummaryTeamTable } from './SummaryTeamTable';

export const NavItem = ({ title, eventKey, count, countLoading }) => (
  <Nav.Item className="text-nowrap">
    <Nav.Link eventKey={eventKey}>
      {title}
      <Badge variant="default" outline pill className="ms-2">
        {countLoading ? <LoadingSpinnerIcon /> : count || 0}
      </Badge>
    </Nav.Link>
  </Nav.Item>
);

interface OwnProps {
  row: Customer;
}

export const OrganizationExpandableRow: FC<OwnProps> = (props) => {
  const [projectsCount, resourcesCount, teamCount] = useQueries({
    queries: [
      {
        queryKey: ['projectsCount', props.row.uuid],
        queryFn: () =>
          getProjectsCount({ params: { customer: props.row.uuid } }),
      },
      {
        queryKey: ['resourcesCount', props.row.uuid],
        queryFn: () =>
          getResourcesCount({
            params: {
              customer_uuid: props.row.uuid,
              state: getStates().map((state) => state.value),
            },
          }),
      },
      {
        queryKey: ['teamCount', props.row.uuid],
        queryFn: () => getCustomerUsersCount(props.row.uuid),
      },
    ],
  });
  return (
    <ExpandableContainer>
      <TableTabsContainer
        defaultActiveKey="projects"
        unmountOnExit={true}
        className="min-h-375px"
      >
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
            <NavItem
              title={translate('Projects')}
              eventKey="projects"
              count={projectsCount.data}
              countLoading={projectsCount.isLoading}
            />
            <NavItem
              title={translate('Resources')}
              eventKey="resources"
              count={resourcesCount.data}
              countLoading={resourcesCount.isLoading}
            />
            <NavItem
              title={translate('Team')}
              eventKey="team"
              count={teamCount.data}
              countLoading={teamCount.isLoading}
            />
          </Nav>
        </div>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="projects" unmountOnExit={true}>
            <SummaryOrganizationProjects customer={props.row} />
          </Tab.Pane>
          <Tab.Pane eventKey="resources" unmountOnExit={true}>
            <SummaryResourcesTable scope={props.row} context="organization" />
          </Tab.Pane>
          <Tab.Pane eventKey="team" unmountOnExit={true}>
            <SummaryTeamTable scope={props.row} context="organization" />
          </Tab.Pane>
        </Tab.Content>
      </TableTabsContainer>
    </ExpandableContainer>
  );
};
