import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ProjectLink } from './ProjectLink';
import { canEditProject } from './utils';

interface ProjectCardProps {
  project: Project;
  onClickDetails?(row): void;
}

export const ProjectCard: FunctionComponent<ProjectCardProps> = ({
  project,
  onClickDetails,
}) => {
  const user = useSelector(getUser);
  const canEdit = canEditProject(user, {
    customer: { uuid: project.customer_uuid },
    project,
  });
  return (
    <ModelCard1
      title={project.name}
      titleNode={
        <ProjectLink row={project} onClick={() => onClickDetails(project)} />
      }
      ellipsisLines={2}
      logo={project.image}
      body={
        <>
          <Field
            label={translate('Organization')}
            value={project.customer_name}
            labelCol={6}
            valueCol={6}
            valueClass="ellipsis"
          />
          <Field
            label={translate('Resources')}
            value={renderFieldOrDash(project.resources_count)}
            labelCol={6}
            valueCol={6}
          />
          <Field
            label={
              project.start_date && project.end_date
                ? translate('Start-end date')
                : project.start_date
                  ? translate('Start date')
                  : translate('End date')
            }
            value={
              [
                project.start_date && formatDate(project.start_date),
                project.end_date && formatDate(project.end_date),
              ]
                .filter(Boolean)
                .join('-') || DASH_ESCAPE_CODE
            }
            labelCol={6}
            valueCol={6}
          />
          <Field
            label={translate('Cost estimation')}
            value={defaultCurrency(
              (project.billing_price_estimate &&
                project.billing_price_estimate.total) ||
                0,
            )}
            labelCol={6}
            valueCol={6}
          />
          {(project.project_credit || project.project_credit === 0) && (
            <Field
              label={translate('Remaining credit')}
              value={renderFieldOrDash(defaultCurrency(project.project_credit))}
              labelCol={6}
              valueCol={6}
            />
          )}
        </>
      }
      footer={
        <div className="d-flex justify-content-end align-items-center gap-2 my-n3 me-n3">
          <Link
            state="project.dashboard"
            params={{ uuid: project.uuid }}
            onClick={() => onClickDetails(project)}
            className="btn btn-text-primary btn-active-secondary"
          >
            {translate('View details')}
          </Link>
          {canEdit && (
            <Link
              state="project-manage"
              params={{ uuid: project.uuid }}
              className="btn btn-text-primary btn-active-secondary"
            >
              {translate('Edit')}
            </Link>
          )}
        </div>
      }
    />
  );
};
