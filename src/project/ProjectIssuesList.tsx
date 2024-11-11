import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectIssuesList: FunctionComponent = () => {
  const project = useSelector(getProject);

  const scope = useMemo(() => ({ project }), [project]);
  const filter = useMemo(
    () => ({ project: project && project.url }),
    [project],
  );

  return (
    <IssuesList
      hiddenColumns={['customer', 'project']}
      scope={scope}
      filter={filter}
    />
  );
};
