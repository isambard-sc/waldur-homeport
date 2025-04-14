import { useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  Project,
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { GenericPermission, Role } from '@waldur/permissions/types';
import { getProjectRoles } from '@waldur/permissions/utils';
import { showErrorResponse } from '@waldur/store/notify';
import { getProject } from '@waldur/workspace/selectors';

import { ExpirationTimeGroup } from './ExpirationTimeGroup';
import { RoleGroup } from './RoleGroup';
import { UserGroup } from './UserGroup';

const FORM_ID = 'EditUserDialog';

interface EditUserDialogFormData {
  role: Role;
  expiration_time: string;
  user: any;
}

interface EditUserDialogResolve {
  permission: GenericPermission;
  refetch;
}

interface EditUserDialogOwnProps {
  resolve: EditUserDialogResolve;
}

const savePermissions = async (
  project: Project,
  formData: EditUserDialogFormData,
  resolve: EditUserDialogResolve,
) => {
  if (resolve.permission) {
    if (resolve.permission.role_name === formData.role.name) {
      await projectsUpdateUser({
        path: { uuid: project.uuid },
        body: {
          user: resolve.permission.user_uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      });
    } else {
      await projectsDeleteUser({
        path: { uuid: project.uuid },
        body: {
          user: resolve.permission.user_uuid,
          role: resolve.permission.role_name,
        },
      });
      await projectsAddUser({
        path: { uuid: project.uuid },
        body: {
          user: resolve.permission.user_uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      });
    }
  }
  await resolve.refetch();
};

export const EditUserDialog = connect(
  (_, ownProps: EditUserDialogOwnProps) => ({
    initialValues: {
      role: getProjectRoles().find(
        ({ name }) => name === ownProps.resolve.permission.role_name,
      ),
      expiration_time: ownProps.resolve.permission.expiration_time,
    },
  }),
)(
  reduxForm<EditUserDialogFormData, EditUserDialogOwnProps>({
    form: FORM_ID,
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const currentProject = useSelector(getProject);

    const saveUser = useCallback(
      async (formData) => {
        try {
          await savePermissions(currentProject, formData, resolve);
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update permission.')),
          );
        }
      },
      [dispatch, resolve],
    );

    return (
      <form onSubmit={handleSubmit(saveUser)}>
        <ModalDialog
          title={translate('Edit project member')}
          footer={
            <>
              <SubmitButton submitting={submitting}>
                {translate('Save')}
              </SubmitButton>
              <CloseDialogButton />
            </>
          }
        >
          <FormContainer submitting={submitting}>
            <UserGroup permission={resolve.permission} />
            <RoleGroup types={['project']} />
            <ExpirationTimeGroup disabled={submitting} />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
