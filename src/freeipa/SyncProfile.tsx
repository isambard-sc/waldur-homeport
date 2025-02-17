import { ArrowsClockwise } from '@phosphor-icons/react';
import { useCallback, FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { syncProfile } from './api';

export const SyncProfile: FunctionComponent<{
  profile;
  setLoading;
  refreshProfile;
}> = ({ profile, setLoading, refreshProfile }) => {
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await syncProfile(profile.uuid);
      if (response.status === 204) {
        dispatch(
          showSuccess(
            translate('Your FreeIPA has been removed in FreeIPA server.'),
          ),
        );
        return refreshProfile();
      } else {
        dispatch(
          showSuccess(translate('Your FreeIPA has been synced successfully.')),
        );
      }
      setLoading(false);
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to sync FreeIPA profile.')),
      );
      setLoading(false);
    }
  }, [dispatch, setLoading, refreshProfile, profile.uuid]);

  return (
    <Tip
      label={translate('Add Waldur user SSH keys to the FreeIPA profile')}
      id="freeipa-sync-profile"
    >
      <Button variant="primary" className="ms-2" onClick={callback}>
        <span className="svg-icon svg-icon-2">
          <ArrowsClockwise />
        </span>{' '}
        {translate('Sync profile')}
      </Button>
    </Tip>
  );
};
