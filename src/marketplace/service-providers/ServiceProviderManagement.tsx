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
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { SecretValueField } from '../SecretValueField';

import { canRegisterServiceProviderForCustomer } from './selectors';

export const ServiceProviderManagement: React.FC = () => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const canRegisterServiceProvider = useSelector(
    canRegisterServiceProviderForCustomer,
  );
  const [secretCode, setSecretCode] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serviceProvider, setServiceProvider] =
    useState<ServiceProvider | null>(null);

  const showSecretCodeRegenerateConfirm = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Regenerate secret API code'),
        translate(
          'After secret API code has been regenerated, it will not be possible to submit usage with the old key.',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    setIsGenerating(true);
    try {
      const data = await api.generateServiceProviderSecretCode(
        serviceProvider.uuid,
      );
      setSecretCode(data.api_secret_code);
      dispatch(
        showSuccess(
          translate('Service provider API secret code has been generated.'),
        ),
      );
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to generate service provider API secret code.'),
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  };

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

  const deleteServiceProvider = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Disable service provider profile'),
        translate('Are you sure you want to remove service provider profile?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      setDeleting(true);
      await api.deleteServiceProvider(serviceProvider.uuid);
      setDeleting(false);
      setServiceProvider(null);
      dispatch(
        showSuccess(translate('Service provider profile has been disabled.')),
      );
      dispatch(
        setCurrentCustomer({
          ...customer,
          is_service_provider: false,
        }),
      );
    } catch (error) {
      setDeleting(false);
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to disable service provider profile.'),
        ),
      );
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
    try {
      setLoading(true);
      const serviceProvider = await api.getServiceProviderByCustomer({
        customer_uuid: customer.uuid,
      });
      setServiceProvider(serviceProvider);
      if (serviceProvider) {
        try {
          const data = await api.getServiceProviderSecretCode(
            serviceProvider.uuid,
          );
          setSecretCode(data.api_secret_code);
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to get service provider API secret code.'),
            ),
          );
        }
      }
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to load service provider.')),
      );
    } finally {
      setLoading(false);
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
              <SecretValueField value={secretCode} />
            </p>
          </div>
          <div>
            <ActionButton
              title={translate('Regenerate')}
              action={showSecretCodeRegenerateConfirm}
              pending={isGenerating}
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
        {user.is_staff && (
          <ActionButton
            title={translate('Disable service provider profile')}
            action={deleteServiceProvider}
            variant="outline btn-outline-danger"
            pending={deleting}
          />
        )}
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
