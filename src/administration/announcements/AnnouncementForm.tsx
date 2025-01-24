import { useCallback } from 'react';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';

import {
  FormContainer,
  SelectField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createAdminAnnouncement, updateAdminAnnouncement } from '../api';
import { AnnouncementTypeOptions } from '../utils';

interface FormData {
  description: string;
  type: string;
  active_from: string;
  active_to: string;
}

export const AnnouncementForm = connect<
  {},
  {},
  { resolve: { announcement?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.announcement
    ? { ...ownProps.resolve.announcement }
    : undefined,
}))(
  reduxForm<FormData, { resolve: { announcement?; refetch } }>({
    form: 'AdminAnnouncementForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.announcement?.uuid);

    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        let action;
        if (isEdit) {
          action = updateAdminAnnouncement(
            values,
            props.resolve.announcement.uuid,
          );
        } else {
          action = createAdminAnnouncement(values);
        }

        return action
          .then(() => {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                isEdit
                  ? translate('The announcement has been updated.')
                  : translate('New announcement has been created.'),
              ),
            );
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(
              showErrorResponse(
                e,
                isEdit
                  ? translate('Unable to update announcement.')
                  : translate('Unable to create announcement.'),
              ),
            );
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit the announcement')
              : translate('Create new announcement')
          }
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <SelectField
              label={translate('Type')}
              name="type"
              options={AnnouncementTypeOptions}
              required
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              simpleValue
              className="col-md-6"
            />
            <DateTimeField
              label={translate('Active from')}
              name="active_from"
              required
            />
            <DateTimeField
              label={translate('Active to')}
              name="active_to"
              required
            />
            <TextField
              label={translate('Announcement')}
              name="description"
              required
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
