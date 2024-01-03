import { capitalize } from 'lodash';
import { Card, Col, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ServiceDeskProviderLogo } from '@waldur/administration/service-desk/ServiceDeskProviderLogo';
import { ENV } from '@waldur/configs/default';
import { get, sendForm } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { isStaffOrSupport as isStaffOrSupportSelector } from '@waldur/workspace/selectors';

const AdministrationServiceDeskUpdateDialogContainer = lazyComponent(
  () => import('./AdministrationServiceDeskUpdateDialog'),
  'AdministrationServiceDeskUpdateDialogContainer',
);

const getDBSettings = () => get('/override-settings/');
const saveConfig = (values) =>
  sendForm('POST', `${ENV.apiEndpoint}api/override-settings/`, values);

export const AdministrationServiceDesk = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  const dispatch = useDispatch();
  const serviceDeskProviders = ['atlassian', 'zammad', 'smax'];

  const updateServiceDeskSettings = async (serviceDeskProvider) => {
    try {
      const initialPluginValues = await getDBSettings();
      dispatch(
        openModalDialog(AdministrationServiceDeskUpdateDialogContainer, {
          size: 'lg',
          initialValues: initialPluginValues.data,
          serviceDeskProvider: serviceDeskProvider,
        }),
      );
    } catch (e) {
      return;
    }
  };

  const toggleServiceDeskBackend = async (serviceDeskProvider) => {
    if (
      serviceDeskProvider === ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE
    ) {
      serviceDeskProvider = '';
    }
    try {
      await saveConfig({
        WALDUR_SUPPORT_ACTIVE_BACKEND_TYPE: serviceDeskProvider,
      });
      dispatch(showSuccess('Configurations have been updated'));
      location.reload();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update the configurations.')),
      );
    }
  };

  return (
    <Card>
      <Card.Body>
        <Row>
          {serviceDeskProviders.map((serviceDeskProvider, index) => (
            <Col key={index} xs={12} md={6} xl={4} className="mb-6">
              <Card className="bg-light min-h-150px border border-secondary border-hover">
                <Card.Body className="pe-5">
                  <div className="d-flex align-items-center h-100">
                    <div className="d-flex flex-row justify-content-between h-100 flex-grow-1">
                      <div
                        style={{
                          width: 70,
                          marginRight: 17,
                        }}
                      >
                        <ServiceDeskProviderLogo name={serviceDeskProvider} />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h1 className="fs-2 text-nowrap fw-boldest">
                        {translate(serviceDeskProvider.toUpperCase())}
                      </h1>
                      <p className="fs-6 text-dark">
                        {translate(
                          '{supportServiceProvider} service provider for service desk.',
                          {
                            supportServiceProvider:
                              capitalize(serviceDeskProvider),
                          },
                          formatJsxTemplate,
                        )}
                      </p>
                      <DropdownButton
                        variant={
                          ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
                          serviceDeskProvider
                            ? 'primary'
                            : 'warning'
                        }
                        title={
                          ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
                          serviceDeskProvider
                            ? translate('Enabled')
                            : translate('Disabled')
                        }
                      >
                        {isStaffOrSupport && (
                          <Dropdown.Item
                            onClick={() =>
                              updateServiceDeskSettings(serviceDeskProvider)
                            }
                          >
                            {translate('Configure')}
                          </Dropdown.Item>
                        )}
                        {isStaffOrSupport && (
                          <Dropdown.Item
                            onClick={() =>
                              toggleServiceDeskBackend(serviceDeskProvider)
                            }
                          >
                            {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
                            serviceDeskProvider
                              ? translate('Disable')
                              : translate('Enable')}
                          </Dropdown.Item>
                        )}
                      </DropdownButton>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};
