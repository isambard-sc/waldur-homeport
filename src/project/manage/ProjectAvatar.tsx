import { UploadSimple } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { setCurrentProject } from '@waldur/workspace/actions';
import { Project } from '@waldur/workspace/types';

import { updateProject } from '../api';

interface ProjectAvatarProps {
  project: Project;
}

interface FormData {
  image;
}

export const ProjectAvatar = ({ project }: ProjectAvatarProps) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);
  const dispatch = useDispatch();

  const processRequest = async (data: FormData) => {
    try {
      const newProject = await updateProject(project.uuid, data);
      dispatch(setCurrentProject(newProject.data as Project));
      showSuccess(translate('Project has been updated.'));
      dispatch(closeModalDialog());
    } catch (e) {
      showErrorResponse(e, translate('Project could not be updated.'));
    }
  };
  return (
    <Form
      onSubmit={processRequest}
      initialValues={{ image: project.image }}
      render={({ handleSubmit, submitting }) => (
        <Card as="form" onSubmit={handleSubmit} className="card-bordered mb-5">
          <Card.Header>
            <Card.Title>
              <h3>{translate('Avatar')}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Field
              name="image"
              component={WideImageField as any}
              alt={abbreviation}
              initialValue={project.image}
              max={2 * 1024 * 1024} // 2MB
              size={65}
              extraActions={({ isChanged, isTooLarge }) =>
                isChanged || submitting ? (
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="btn-icon-right"
                    disabled={submitting || isTooLarge}
                  >
                    {translate('Save')}
                    <span className="svg-icon svg-icon-5">
                      <UploadSimple weight="bold" />
                    </span>
                  </Button>
                ) : null
              }
            />
          </Card.Body>
        </Card>
      )}
    />
  );
};
