import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { canRegisterServiceProviderForCustomer } from '@waldur/marketplace/service-providers/selectors';
import { ServiceProviderManagement } from '@waldur/marketplace/service-providers/ServiceProviderManagement';
import { ServiceProvider } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const CustomerMarketplacePanel: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const canRegisterServiceProvider = useSelector(
    canRegisterServiceProviderForCustomer,
  );

  const queryClient = useQueryClient();
  const {
    data: serviceProvider,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['ServiceProvider', customer?.uuid],
    () =>
      customer?.uuid
        ? api.getServiceProviderByCustomer({
            customer_uuid: customer.uuid,
          })
        : null,
    {
      refetchOnWindowFocus: false,
      onError: (error: any) => {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to load service provider.'),
          ),
        );
      },
    },
  );

  const setServiceProvider = (data: ServiceProvider) => {
    queryClient.setQueryData(['ServiceProvider', customer?.uuid], data);
  };

  const { mutate: registerServiceProvider, isLoading: isRegistering } =
    useMutation(async () => {
      const successMessage = translate('Service provider has been registered.');
      const errorMessage = translate('Unable to register service provider.');
      try {
        const serviceProvider = await api.createServiceProvider({
          customer: customer.url,
        });
        setServiceProvider(serviceProvider);
        dispatch(showSuccess(successMessage));
        dispatch(
          setCurrentCustomer({
            ...customer,
            is_service_provider: true,
          }),
        );
      } catch (error) {
        dispatch(showErrorResponse(error, errorMessage));
      }
    });

  const { mutate: deleteServiceProvider, isLoading: isDeleting } = useMutation(
    async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Disable service provider profile'),
          translate(
            'Are you sure you want to remove service provider profile?',
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }

      try {
        await api.deleteServiceProvider(serviceProvider.uuid);
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
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to disable service provider profile.'),
          ),
        );
      }
    },
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!customer.is_service_provider && !canRegisterServiceProvider) {
    return (
      <p className="my-3 text-muted fs-6 text-center">
        {translate('You can not register organization as a service provider')}
      </p>
    );
  } else {
    return (
      <FormTable.Card
        title={translate('Details')}
        className="card-bordered"
        actions={
          serviceProvider && user.is_staff ? (
            <ActionButton
              title={translate('Disable service provider profile')}
              action={deleteServiceProvider}
              variant="outline btn-outline-danger"
              pending={isDeleting}
            />
          ) : !serviceProvider && canRegisterServiceProvider ? (
            <ActionButton
              title={translate('Register as service provider')}
              action={registerServiceProvider}
              variant="secondary"
              pending={isRegistering}
            />
          ) : null
        }
      >
        {!serviceProvider && canRegisterServiceProvider ? (
          <p className="my-3 text-muted fs-6">
            {translate(
              'You can register organization as a service provider by pressing the button',
            )}
          </p>
        ) : serviceProvider ? (
          <ServiceProviderManagement
            serviceProvider={serviceProvider}
            setServiceProvider={setServiceProvider}
          />
        ) : null}
      </FormTable.Card>
    );
  }
};
