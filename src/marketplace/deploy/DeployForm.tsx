import { useRouter } from '@uirouter/react';
import { FC, PropsWithChildren } from 'react';
import { SubmissionError } from 'redux-form';
import {
  marketplaceOrdersCreate,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatOrderForCreate } from '../details/utils';
import { scrollToSectionById } from '../offerings/utils';

export const DeployForm: FC<
  PropsWithChildren<{ offering: PublicOfferingDetails; handleSubmit }>
> = ({ offering, handleSubmit, children }) => {
  const router = useRouter();
  const mutate = async (values, dispatch) => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to submit the order?'),
    );
    try {
      const order = await marketplaceOrdersCreate({
        body: formatOrderForCreate({
          offering,
          formData: values,
        }),
      });
      dispatch(showSuccess(translate('Order has been submitted.')));
      router.stateService.go('marketplace-resource-details', {
        resource_uuid: order.data.marketplace_resource_uuid,
      });
    } catch (error) {
      const errorMessage = translate('Unable to submit order.');
      dispatch(showErrorResponse(error, errorMessage));
      const errorData = {} as any;
      const _errorData = error?.response?.data;
      if (_errorData && typeof _errorData === 'object') {
        for (const key of Object.keys(_errorData)) {
          if (key === 'non_field_errors') {
            Object.assign(errorData, { plan_entries: _errorData[key] });
            // Scroll to plan step
            scrollToSectionById('step-plan');
          } else {
            Object.assign(errorData, { [key]: _errorData[key] });
          }
        }
      }
      throw new SubmissionError({
        _error: errorMessage,
        ...errorData,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(mutate)} noValidate>
      {children}
    </form>
  );
};
