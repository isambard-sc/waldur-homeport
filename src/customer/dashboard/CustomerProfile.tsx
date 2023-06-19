import { useRouter } from '@uirouter/react';
import React, { useMemo } from 'react';
import { Card, Col, Form, Row, Stack } from 'react-bootstrap';

import 'world-flags-sprite/stylesheets/flags32.css';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { ServiceProviderIcon } from '@waldur/navigation/workspace/ServiceProviderIcon';
import { Customer, User } from '@waldur/workspace/types';

import { CustomerActions } from './CustomerActions';
import { SymbolsGroup } from './SymbolsGroup';

export const CustomerProfile = ({ customer }: { customer: Customer }) => {
  const router = useRouter();
  const goToUsers = () => router.stateService.go('organization-users');
  const abbreviation = useMemo(() => getItemAbbreviation(customer), [customer]);

  const owners = React.useMemo(
    () =>
      customer.owners.map((owner: User) => ({
        email: owner.email,
        full_name: owner.full_name,
        image: owner.image,
      })),
    [customer],
  );
  const managers = React.useMemo(
    () =>
      customer.service_managers.map((member: User) => ({
        email: member.email,
        full_name: member.full_name,
        image: member.image,
      })),
    [customer],
  );

  return (
    <Card className="mb-6">
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
                    {abbreviation}
                  </div>
                </ImagePlaceholder>
              </div>
            )}
          </Col>
          <Col>
            <Row className="mb-6">
              <Col>
                <Stack direction="horizontal" className="gap-6 text-muted mb-1">
                  <div className="d-flex align-items-center gap-2">
                    {customer.country && (
                      <i className="f32">
                        <i
                          className={`flag ${customer.country?.toLowerCase()}`}
                        ></i>
                      </i>
                    )}
                    <h2 className="mb-0">{customer.name}</h2>
                  </div>
                  <ServiceProviderIcon organization={customer} />
                </Stack>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  {[
                    customer.division_name,
                    customer.email,
                    customer.phone_number,
                  ].map((item, i) => item && <span key={i}>{item}</span>)}
                </Stack>
              </Col>
              <Col xs="auto">
                <CustomerActions />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className="d-flex justify-content-start align-items-xl-center flex-xl-row flex-column gap-xl-6">
                  {owners && owners.length > 0 && (
                    <Form.Group as={Row} className="mb-1">
                      <Form.Label column xs="auto">
                        {translate('Owners:')}
                      </Form.Label>
                      <Col>
                        <SymbolsGroup
                          items={owners}
                          max={6}
                          onClick={goToUsers}
                        />
                      </Col>
                    </Form.Group>
                  )}
                  {managers && managers.length > 0 && (
                    <Form.Group as={Row} className="mb-1">
                      <Form.Label column xs="auto">
                        {translate('Managers:')}
                      </Form.Label>
                      <Col>
                        <SymbolsGroup items={managers} onClick={goToUsers} />
                      </Col>
                    </Form.Group>
                  )}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
