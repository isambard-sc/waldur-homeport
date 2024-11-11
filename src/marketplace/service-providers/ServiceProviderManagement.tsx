import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { FieldEditButton } from '@waldur/customer/details/FieldEditButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { ServiceProvider } from '@waldur/marketplace/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { SecretValueField } from '../SecretValueField';

import { canRegisterServiceProviderForCustomer } from './selectors';
import {
  secretCodeFetchStart,
  showSecretCodeRegenerateConfirm,
} from './store/actions';
import { getServiceProviderSecretCode } from './store/selectors';

export const ServiceProviderManagement: React.FC = () => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const canRegisterServiceProvider = useSelector(
    canRegisterServiceProviderForCustomer,
  );
  const secretCode = useSelector(getServiceProviderSecretCode);

  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceProvider, setServiceProvider] =
    useState<ServiceProvider | null>(null);

  const registerServiceProvider = async () => {
    const successMessage = translate('Service provider has been registered.');
    const errorMessage = translate('Unable to register service provider.');
    try {
      setRegistering(true);
      const serviceProvider = await api.createServiceProvider({
        customer: customer.url,
      });
      setRegistering(false);
      setServiceProvider(serviceProvider);
      dispatch(showSuccess(successMessage));
      dispatch(
        setCurrentCustomer({
          ...customer,
          is_service_provider: true,
        }),
      );
    } catch (error) {
      setRegistering(false);
      dispatch(showErrorResponse(error, errorMessage));
    }
  };

  const update = async (formData) => {
    try {
      setLoading(true);
      const res = await api.updateServiceProvider(
        serviceProvider.uuid,
        formData,
      );
      setLoading(false);
      setServiceProvider(res.data);
      return res;
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error?.response?.message || translate('Something went wrong');
      const errorData = error?.response?.data;
      throw new SubmissionError({
        _error: errorMessage,
        ...errorData,
      });
    }
  };

  const getServiceProvider = async () => {
    const errorMessage = translate('Unable to load service provider.');
    try {
      setLoading(true);
      const serviceProvider = await api.getServiceProviderByCustomer({
        customer_uuid: customer.uuid,
      });
      setLoading(false);
      setServiceProvider(serviceProvider);
      if (serviceProvider) {
        dispatch(secretCodeFetchStart(serviceProvider));
      }
    } catch (error) {
      setLoading(false);
      dispatch(showErrorResponse(error, errorMessage));
    }
  };

  useEffect(() => {
    getServiceProvider();
  }, [customer]);

  if (!customer) {
    return null;
  } else if (loading) {
    return <LoadingSpinner />;
  } else if (serviceProvider) {
    return (
      <>
        <div className="d-flex justify-content-between">
          <div>
            <p>
              {`${translate('Registered at:')} ${formatDateTime(
                serviceProvider.created,
              )}`}
            </p>
            <p>
              {translate('API secret code:')}
              <SecretValueField value={secretCode.code} />
            </p>
          </div>
          <div>
            <ActionButton
              title={translate('Regenerate')}
              action={() =>
                dispatch(showSecretCodeRegenerateConfirm(serviceProvider))
              }
              pending={secretCode.generating}
              className="btn btn-primary"
            />
          </div>
        </div>

        <FormTable>
          <FormTable.Item
            label={translate('Description')}
            value={serviceProvider?.description}
            actions={
              <FieldEditButton
                customer={serviceProvider}
                name="description"
                callback={update}
              />
            }
          />
        </FormTable>
      </>
    );
  } else if (canRegisterServiceProvider) {
    return (
      <div className="d-flex justify-content-between">
        <p>
          {translate(
            'You can register organization as a service provider by pressing the button',
          )}
        </p>
        <div>
          <ActionButton
            title={translate('Register as service provider')}
            action={registerServiceProvider}
            className="btn btn-primary"
            pending={registering}
          />
        </div>
      </div>
    );
  } else {
    return null;
  }
};
