import { useCallback, useState, FunctionComponent } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { setCurrentUser } from '@waldur/workspace/actions';

import { getCurrentUser } from '../UsersService';

import { RequestedEmail } from './RequestedEmail';

const UserEmailChangeDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UserEmailChangeDialog" */ './UserEmailChangeDialog'
    ),
  'UserEmailChangeDialog',
);

export const EmailField: FunctionComponent<any> = (props) => {
  const [waiting, setWaiting] = useState(false);
  const dispatch = useDispatch();
  const openChangeDialog = useCallback(() => {
    dispatch(
      openModalDialog(UserEmailChangeDialog, {
        resolve: { user: props.user },
      }),
    );
  }, [dispatch, props.user]);
  const cancelRequest = useCallback(async () => {
    try {
      setWaiting(true);
      await post(`/users/${props.user.uuid}/cancel_change_email/`, {
        user: props.user,
      });
      const newUser = await getCurrentUser();
      dispatch(setCurrentUser(newUser));
    } catch (error) {
      setWaiting(false);
      const errorMessage = `${translate('Unable to cancel request.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      return;
    }
    setWaiting(false);
    dispatch(
      showSuccess(translate('Email change request has been cancelled.')),
    );
  }, []);

  return (
    <>
      <Form.Group as={Row} className="mb-8">
        <Form.Label column sm={3} md={4}>
          {translate('Email')}
        </Form.Label>
        <Col>
          <Form.Control
            readOnly
            defaultValue={props.user.email}
            className="form-control-solid"
          />
          {props.protected && (
            <Form.Text muted>
              {translate('Synchronized from identity provider')}
            </Form.Text>
          )}
        </Col>
        <Col xs="auto">
          {!props.user.requested_email && !props.protected && (
            <Button onClick={openChangeDialog} variant="secondary" size="sm">
              {translate('Request change')}
            </Button>
          )}
        </Col>
      </Form.Group>
      {props.user.requested_email && !props.protected && (
        <RequestedEmail
          requestedEmail={props.user.requested_email}
          onCancelRequest={cancelRequest}
          waiting={waiting}
        />
      )}
    </>
  );
};
