import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { isEmpty } from '@waldur/core/utils';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectEventsFilter } from './ProjectEventsFilter';

const PureProjectEvents = getEventsList({
  mapPropsToFilter: (props) => {
    const filter = {
      ...props.userFilter,
      feature: props.userFilter?.feature?.map((option) => option.value),
    };
    if (props.project) {
      filter.scope = props.project.url;
    }
    if (props.userFilter && isEmpty(props.userFilter.feature)) {
      filter.feature = ['projects', 'resources'];
    }
    return filter;
  },
  mapPropsToTableId: (props) => ['project-events', props.project?.uuid],
});

const mapStateToProps = (state: RootState) => ({
  userFilter: getFormValues('projectEventsFilter')(state),
  project: getProject(state),
});

const ProjectEvents = connect(mapStateToProps)(PureProjectEvents);

export const ProjectEventsView: FunctionComponent<any> = (props) => {
  return (
    <ProjectEvents
      title={translate('Audit logs')}
      {...props}
      filters={<ProjectEventsFilter />}
    />
  );
};
