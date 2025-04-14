import { useSelector } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { DeployPageTotalCard } from '@waldur/marketplace/deploy/DeployPageTotalCard';
import {
  formErrorsSelector,
  formIsValidSelector,
} from '@waldur/marketplace/deploy/utils';
import { OrderSubmitButton } from '@waldur/marketplace/details/OrderSubmitButton';
import { orderFormDataSelector } from '@waldur/marketplace/utils';

interface CheckoutSummaryProps {
  offering: PublicOfferingDetails;
  updateMode?: boolean;
}

export const CheckoutSummary = ({
  offering,
  updateMode,
}: CheckoutSummaryProps) => {
  const formIsValid = useSelector(formIsValidSelector);
  const formData = useSelector(orderFormDataSelector);
  const errors = useSelector(formErrorsSelector);

  return (
    <DeployPageTotalCard
      offering={offering}
      header={
        <h5 className="fw-normal text-muted mb-0">
          {translate(
            'Charged as part of {name}.',
            {
              name: <strong>{offering.scope_name}</strong>,
            },
            formatJsxTemplate,
          )}
        </h5>
      }
    >
      <OrderSubmitButton
        formData={formData}
        updateMode={updateMode}
        offering={offering}
        errors={errors}
        formValid={formIsValid}
      />
    </DeployPageTotalCard>
  );
};
