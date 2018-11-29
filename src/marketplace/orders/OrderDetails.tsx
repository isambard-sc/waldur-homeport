import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { TranslateProps } from '@waldur/i18n';
import { getOrderDetails } from '@waldur/marketplace/common/api';
import { OrderSummary } from '@waldur/marketplace/orders/OrderSummary';

import { ApproveButton } from './ApproveButton';
import { Order } from './Order';
import { OrderSteps } from './OrderSteps';
import { State } from './types';
import { StatusChange } from './types';
import { matchState } from './utils';

interface OrderDetailsProps extends TranslateProps {
  approveOrder: (orderUuid: string) => void;
  stateChangeStatus: StatusChange;
  shouldRenderApproveButton?: boolean;
}

interface OrderDetailsState {
  orderDetails: State;
  loading: boolean;
  loaded: boolean;
}

export class OrderDetails extends React.Component<OrderDetailsProps, OrderDetailsState> {
  state = {
    orderDetails: undefined,
    loading: true,
    loaded: false,
  };

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.stateChangeStatus !== this.props.stateChangeStatus) {
      this.loadData();
    }
  }

  async loadData() {
    try {
      const orderDetails = await getOrderDetails($state.params.order_uuid);
      this.setState({
        orderDetails: {
          state: matchState(orderDetails.state),
          items: orderDetails.items,
          total_cost: orderDetails.total_cost,
          file: orderDetails.file,
        },
        loading: false,
        loaded: true,
      });
    } catch {
      this.setState({
        orderDetails: {state: 'Approve', items: []},
        loading: false,
        loaded: false,
      });
    }
  }

  renderApproveButton = () => {
    return this.props.shouldRenderApproveButton && this.state.orderDetails && this.state.orderDetails.state === 'Approve';
  }

  approveOrder = () => {
    this.props.approveOrder($state.params.order_uuid);
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load order details.')}
        </h3>
      );
    }

    return (
      <Row>
        <Col lg={8}>
          <OrderSteps state={this.state.orderDetails.state} />
          <Order
            items={this.state.orderDetails.items}
            editable={false}
          />
          <div className="text-right">
            {this.renderApproveButton() && (
              <ApproveButton
                submitting={this.props.stateChangeStatus.processing}
                onClick={this.approveOrder}
              />
            )}
            <button
              type="button"
              className="btn btn-default btn-sm m-l-sm"
              onClick={() => this.loadData()}
            >
              <i className="fa fa-refresh"/>
              {' '}
              {this.props.translate('Refresh')}
            </button>
          </div>
        </Col>
        <Col lg={4}>
          <OrderSummary
            total={this.state.orderDetails.total_cost}
            file={this.state.orderDetails.file}
          />
        </Col>
      </Row>
    );
  }
}
