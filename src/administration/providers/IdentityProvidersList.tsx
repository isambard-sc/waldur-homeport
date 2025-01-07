import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'react-bootstrap';

import {
  EDUTEAMS_IDP,
  KEYCLOAK_IDP,
  LOCAL_IDP,
  SAML2_IDP,
  TARA_IDP,
} from '@waldur/auth/providers/constants';
import { ENV } from '@waldur/configs/default';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getIdentityProviders } from '../api';
import { getDBSettings } from '../settings/api';
import { SettingsCard } from '../settings/SettingsCard';

import { ProviderCard } from './ProviderCard';

export const IdentityProvidersList = () => {
  const {
    data: providersData,
    isLoading: isProvidersLoading,
    error: providersError,
    refetch: refetchProviders,
  } = useQuery<{}, {}, Record<string, { is_active }>>(
    ['IdentityProvidersList'],
    () =>
      getIdentityProviders().then((providers) =>
        providers.reduce(
          (result, item) => ({ ...result, [item.provider]: item }),
          {},
        ),
      ),
  );
  const {
    data: settingsData,
    isLoading: isSettingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery(['AdministrationUserSettings'], () =>
    getDBSettings().then((response) => response.data),
  );
  if (isProvidersLoading || isSettingsLoading) return <LoadingSpinner />;
  if (providersError || settingsError) {
    let errorMessage = translate('Unable to load ');
    if (providersError && settingsError) {
      errorMessage += translate('providers and settings configuration');
    } else if (providersError) {
      errorMessage += translate('providers configuration');
    } else {
      errorMessage += translate('settings configuration');
    }

    return (
      <LoadingErred
        message={errorMessage}
        loadData={() => {
          refetchProviders();
          refetchSettings();
        }}
      />
    );
  }
  return providersData && settingsData ? (
    <>
      <SettingsCard
        groupNames={[translate('User settings')]}
        settingsSource={settingsData}
      />
      <Card className="card-bordered">
        <Card.Body>
          <Row>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="Keycloak"
                description={translate(
                  'Open source identity and access management solution.',
                )}
                provider={providersData.keycloak}
                type={KEYCLOAK_IDP}
                refetch={refetchProviders}
              />
            </Col>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="TARA"
                description={translate(
                  'Identity service of the Republic of Estonia',
                )}
                provider={providersData.tara}
                type={TARA_IDP}
                refetch={refetchProviders}
              />
            </Col>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="eduTEAMS"
                description={translate(
                  'Global federation of identity providers for researchers.',
                )}
                provider={providersData.eduteams}
                type={EDUTEAMS_IDP}
                refetch={refetchProviders}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title={translate('Local identity provider')}
                description={translate(
                  'Digital identity is managed by Waldur itself.',
                )}
                provider={{
                  is_active:
                    ENV.plugins.WALDUR_CORE['AUTHENTICATION_METHODS'].includes(
                      'LOCAL_SIGNIN',
                    ),
                }}
                type={LOCAL_IDP}
                refetch={refetchProviders}
                editable={false}
              />
            </Col>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="SAML2"
                description={translate(
                  'Single sign-on using SAML2-based identity federation.',
                )}
                provider={{
                  is_active:
                    ENV.plugins.WALDUR_CORE['AUTHENTICATION_METHODS'].includes(
                      'SAML2',
                    ),
                }}
                type={SAML2_IDP}
                refetch={refetchProviders}
                editable={false}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  ) : null;
};
