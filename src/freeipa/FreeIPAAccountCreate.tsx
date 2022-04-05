import { useEffect, useCallback } from 'react';
import { Col, FormGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import {
  showSuccess,
  showError,
  showErrorResponse,
} from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { createProfile } from './api';
import { UsernameGroup } from './UsernameGroup';

const FORM_ID = 'FreeIPAAccountCreate';

interface FreeIPAAccountCreateFormData {
  username: string;
}

interface FreeIPAAccountCreateOwnProps {
  onProfileAdded(): void;
}

const SUGGESTED_USERNAME_PATTERN = /[^a-zA-Z0-9._-]/g;

const fixUsername = (username: string): string =>
  username.replace(SUGGESTED_USERNAME_PATTERN, '_');

export const FreeIPAAccountCreate = reduxForm<
  FreeIPAAccountCreateFormData,
  FreeIPAAccountCreateOwnProps
>({ form: FORM_ID })(
  ({ invalid, submitting, handleSubmit, onProfileAdded }) => {
    const dispatch = useDispatch();
    const user = useSelector(getUser);

    useEffect(() => {
      dispatch(change(FORM_ID, 'username', fixUsername(user.username)));
    }, [user, dispatch]);

    const callback = useCallback(
      async (formData) => {
        try {
          await createProfile(formData.username);
          dispatch(showSuccess(translate('A profile has been created.')));
          onProfileAdded();
        } catch (response) {
          if (response.data && response.data.username) {
            dispatch(showError(response.data.username));
          }
          dispatch(
            showErrorResponse(
              response,
              translate('Unable to create a FreeIPA profile.'),
            ),
          );
        }
      },
      [dispatch, onProfileAdded],
    );

    return (
      <form onSubmit={handleSubmit(callback)}>
        <UsernameGroup />
        <FormGroup>
          <Col sm={{ span: 5, offset: 3 }}>
            <SubmitButton
              submitting={submitting}
              invalid={invalid}
              block={false}
            >
              <i className="fa fa-plus" /> {translate('Create')}
            </SubmitButton>
          </Col>
        </FormGroup>
      </form>
    );
  },
);
