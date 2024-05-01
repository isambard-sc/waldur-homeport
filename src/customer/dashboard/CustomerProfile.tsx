import { Card, Col, Row, Stack } from 'react-bootstrap';

import 'world-flags-sprite/stylesheets/flags32.css';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { ProviderOfferingPermissions } from '@waldur/marketplace/service-providers/dashboard/ProviderOfferingPermissions';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { Customer } from '@waldur/workspace/types';

import { CustomerActions } from './CustomerActions';
import { CustomerUsersBadge } from './CustomerUsersBadge';

interface CustomerProfileProps {
  customer: Customer;
  fromServiceProvider?: boolean;
}

export const CustomerProfile = ({
  customer,
  fromServiceProvider,
}: CustomerProfileProps) => (
  <Card>
    <Card.Body>
      <Row>
        <Col xs="auto">
          {customer.image ? (
            <Image src={customer.image} size={100} />
          ) : (
            <div className="symbol">
              <ImagePlaceholder
                width="100px"
                height="100px"
                backgroundColor="#e2e2e2"
              >
                <div className="symbol-label fs-2 fw-bold w-100 h-100">
                  {getItemAbbreviation(customer)}
                </div>
              </ImagePlaceholder>
            </div>
          )}
        </Col>
        <Col>
          <Row className="mb-6">
            <Col>
              <Stack
                direction="horizontal"
                gap={2}
                className="gap-6 text-muted mb-1"
              >
                {customer.country && (
                  <i className="f32">
                    <i
                      className={`flag ${customer.country?.toLowerCase()}`}
                    ></i>
                  </i>
                )}
                <h2 className="mb-0">{customer.name}</h2>
              </Stack>
              <Stack direction="horizontal" className="gap-6 text-muted">
                {[
                  customer.organization_group_name,
                  customer.email,
                  typeof customer.phone_number === 'string'
                    ? customer.phone_number
                    : undefined,
                ].map((item, i) => item && <span key={i}>{item}</span>)}
              </Stack>
            </Col>
            <Col xs="auto">
              <CustomerActions />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {fromServiceProvider ? (
                <ProviderOfferingPermissions customer={customer} />
              ) : (
                <CustomerUsersBadge />
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);
