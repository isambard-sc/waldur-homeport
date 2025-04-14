import React from 'react';
import { connect } from 'react-redux';
import { isValid } from 'redux-form';
import { PublicOfferingDetails } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { SummaryTable } from '@waldur/marketplace/details/OrderSummary';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { OrderSummaryProps } from '@waldur/marketplace/details/types';
import { orderFormDataSelector } from '@waldur/marketplace/utils';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

const PureOrderDetailsSummary: React.FC<OrderSummaryProps> = (
  props: OrderSummaryProps,
) => <SummaryTable {...props} />;

type StateProps = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: pricesSelector(state, ownProps).total,
  formData: orderFormDataSelector(state),
  formValid: isValid(ORDER_FORM_ID)(state),
  shouldConcealPrices: isFeatureVisible(MarketplaceFeatures.conceal_prices),
});

export const OrderDetailsSummary = connect<
  StateProps,
  {},
  { offering: PublicOfferingDetails }
>(mapStateToProps)(PureOrderDetailsSummary);
