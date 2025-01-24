import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updatePlanPrices } from '@waldur/marketplace/common/api';
import { Offering, OfferingComponent, Plan } from '@waldur/marketplace/types';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { EDIT_PLAN_FORM_ID } from './constants';
import { PricesTable } from './PricesTable';

const getInitialValues = (plan: Plan, components: OfferingComponent[]) => {
  const availableComponentTypes = new Set(components.map((c) => c.type));
  const filterPrices = (prices) =>
    Object.fromEntries(
      Object.entries(prices || {}).filter(([key]) =>
        availableComponentTypes.has(key),
      ),
    );

  const filteredPrices = filterPrices(plan.prices);
  const filteredFuturePrices = filterPrices(plan.future_prices);

  return {
    prices: filteredPrices,
    future_prices: filteredFuturePrices,
    new_prices:
      plan.resources_count > 0
        ? {
            ...filteredPrices,
            ...filteredFuturePrices,
          }
        : filteredPrices,
  };
};

export const EditPlanPricesDialog = connect<
  {},
  {},
  { resolve: { plan: Plan; offering: Offering } }
>((_, ownProps) => ({
  initialValues: getInitialValues(
    ownProps.resolve.plan,
    ownProps.resolve.offering.components,
  ),
}))(
  reduxForm<{}, { resolve: { offering; plan; refetch } }>({
    form: EDIT_PLAN_FORM_ID,
  })((props) => {
    const { showErrorResponse, showSuccess } = useNotify();
    const { closeDialog } = useModal();
    const update = async (formData) => {
      try {
        await updatePlanPrices(props.resolve.plan.uuid, {
          prices: formData.new_prices,
        });
        showSuccess(translate('Prices have been updated successfully.'));
        await props.resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to update prices.'));
      }
    };

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>
            {props.resolve.plan.resources_count > 0
              ? translate('Edit prices for next month')
              : translate('Edit prices for current month')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PricesTable
            components={props.resolve.offering.components}
            plan={props.resolve.plan}
          />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
