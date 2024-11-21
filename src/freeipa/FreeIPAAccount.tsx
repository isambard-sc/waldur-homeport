import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { showError } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { getProfile } from './api';
import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';
import { FreeIPAAccountEdit } from './FreeIPAAccountEdit';
import { SyncProfile } from './SyncProfile';

export const FreeIpaAccount = () => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  if (!ENV.plugins.WALDUR_FREEIPA?.ENABLED) {
    dispatch(showError(translate('FreeIPA extension is disabled.')));
    router.stateService.go('errorPage.notFound');
  }

  const [{ loading: isLoading, error, value: profile }, refreshProfile] =
    useAsyncFn(() => getProfile(user.uuid), [user.uuid]);

  useEffectOnce(() => {
    refreshProfile();
  });
  const [loading, setLoading] = React.useState<boolean>();

  if (isLoading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load data.')}</>;

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Row className="card-toolbar g-0 gap-4 w-100">
          <Col xs className="order-0 mw-sm-25">
            <Card.Title>
              <span className="h3 me-2">{translate('FreeIPA account')}</span>
            </Card.Title>
          </Col>
          {profile && (
            <Col sm="auto" className="order-1 order-sm-2 min-w-25 ms-auto">
              <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3">
                <SyncProfile
                  profile={profile}
                  setLoading={setLoading}
                  refreshProfile={refreshProfile}
                />
              </div>
            </Col>
          )}
        </Row>
      </Card.Header>
      <Card.Body>
        {profile ? (
          <FreeIPAAccountEdit profile={profile} loading={loading} />
        ) : (
          <FreeIPAAccountCreate onProfileAdded={refreshProfile} />
        )}
      </Card.Body>
    </Card>
  );
};
