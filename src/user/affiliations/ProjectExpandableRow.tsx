import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { getResourcesCount } from '@waldur/administration/api';
import { translate } from '@waldur/i18n';
import { getStates } from '@waldur/marketplace/resources/list/ResourceStateFilter';
import { getProjectUsersCount } from '@waldur/project/team/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { Project } from '@waldur/workspace/types';

import { TableTabsContainer } from '../../customer/list/TableTabsContainer';

import { NavItem } from './OrganizationExpandableRow';
import { SummaryResourcesTable } from './SummaryResourcesTable';
import { SummaryTeamTable } from './SummaryTeamTable';

interface OwnProps {
  row: Project;
}

export const ProjectExpandableRow: FC<OwnProps> = (props) => {
  const [resourcesCount, teamCount] = useQueries({
    queries: [
      {
        queryKey: ['resourcesCount', props.row.uuid],
        queryFn: () =>
          getResourcesCount({
            params: {
              project_uuid: props.row.uuid,
              state: getStates().map((state) => state.value),
            },
          }),
      },
      {
        queryKey: ['teamCount', props.row.uuid],
        queryFn: () => getProjectUsersCount(props.row.uuid),
      },
    ],
  });
  return (
    <ExpandableContainer>
      <TableTabsContainer
        defaultActiveKey="resources"
        unmountOnExit={true}
        className="min-h-375px"
      >
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
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
          <Tab.Pane eventKey="resources" unmountOnExit={true}>
            <SummaryResourcesTable scope={props.row} context="project" />
          </Tab.Pane>
          <Tab.Pane eventKey="team" unmountOnExit={true}>
            <SummaryTeamTable scope={props.row} context="project" />
          </Tab.Pane>
        </Tab.Content>
      </TableTabsContainer>
    </ExpandableContainer>
  );
};
