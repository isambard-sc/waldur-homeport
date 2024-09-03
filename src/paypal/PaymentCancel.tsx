import { useRouter } from '@uirouter/react';
import Qs from 'qs';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { post } from '@waldur/core/api';
import { getQueryString } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';

const cancelPayment = (payload) => post('/paypal-payments/cancel/', payload);

export const PaymentCancel: FunctionComponent = () => {
  useTitle(translate('Cancel payment'));
  const dispatch = useDispatch();
  const router = useRouter();
  useEffectOnce(() => {
    (async () => {
      const qs = Qs.parse(getQueryString());
      if (!qs.token) {
        dispatch(
          showError(translate('Invalid URL. Unable to parse payment details.')),
        );
        return;
      }
      try {
        await cancelPayment({ token: qs.token });
        dispatch(
          showSuccess(translate('Payment has been processed successfully.')),
        );
        router.stateService.go('profile.details');
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to process payment.')),
        );
      }
    })();
  });
  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        {translate('Payment is being processed, please wait.')}
      </div>
    </div>
  );
};
