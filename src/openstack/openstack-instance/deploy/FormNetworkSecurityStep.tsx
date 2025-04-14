import { PlusCircle, Trash } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { loadFloatingIps, loadSubnets } from '@waldur/openstack/api';

import { getDefaultFloatingIps, formatSubnet } from '../utils';

import { FormSecurityGroupsField } from './FormSecurityGroupsField';
import { FormSSHPublicKeysField } from './FormSSHPublicKeysField';

const renderNetworkRows = ({ fields, subnets, floatingIps }: any) => {
  const availableNetworkItemsFilter = useCallback(
    (itemType) => (item) => {
      let res = true;
      if (fields.length > 0) {
        fields.forEach((_, i) => {
          const net = fields.get(i);
          if (net && net[itemType] && net[itemType].uuid === item.uuid) {
            res = false;
          }
        });
      }
      return res;
    },
    [fields],
  );

  const freeSubnets = useMemo(
    () =>
      subnets.filter(availableNetworkItemsFilter('subnet')).map((subnet) => ({
        ...subnet,
        label: formatSubnet(subnet),
      })),
    [subnets, availableNetworkItemsFilter],
  );

  const freeFloatingIps = useMemo(
    () => [
      ...getDefaultFloatingIps(),
      ...floatingIps.filter(availableNetworkItemsFilter('floatingIp')),
    ],
    [floatingIps, availableNetworkItemsFilter],
  );

  const getDefaultValue = useCallback(
    () => ({
      subnet: freeSubnets.length !== 0 ? freeSubnets[0] : {},
      floatingIp:
        getDefaultFloatingIps().length !== 0 ? getDefaultFloatingIps()[0] : {},
    }),
    [freeSubnets],
  );

  const addRow = useCallback(() => {
    // if has free subnets
    if (freeSubnets.length > 0) {
      fields.push(getDefaultValue());
    }
  }, [fields, freeSubnets, getDefaultValue]);

  useEffect(() => {
    if (fields?.length === 0) {
      addRow();
    }
  }, []);

  return (
    <div className="mb-5">
      <Row>
        <Col sm={6}>
          <Form.Label>{translate('Subnet')}</Form.Label>
        </Col>
        <Col sm={6}>
          <Form.Label>{translate('Floating IP')}</Form.Label>
        </Col>
      </Row>
      {fields.map((network, index) => (
        <Row key={index} className="g-4 mb-4">
          <Col sm={6}>
            <Field
              name={`${network}.subnet`}
              component={SelectField}
              options={freeSubnets}
              validate={[required]}
              required={true}
              placeholder={translate('Select subnet')}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              noUpdateOnBlur
            />
          </Col>
          <Col sm>
            <Field
              name={`${network}.floatingIp`}
              component={SelectField}
              options={freeFloatingIps}
              validate={[required]}
              required={true}
              isDisabled={!fields.get(index)?.subnet?.uuid}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.address}
              noUpdateOnBlur
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="active-light-danger"
              className="btn-icon btn-icon-danger"
              onClick={() => fields.remove(index)}
            >
              <span className="svg-icon svg-icon-1x">
                <Trash weight="bold" />
              </span>
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        variant="active-secondary"
        className="btn-text-primary btn-icon-primary"
        disabled={freeSubnets.length === 0}
        onClick={addRow}
      >
        <span className="svg-icon svg-icon-2">
          <PlusCircle weight="bold" />
        </span>{' '}
        {translate('Add subnet')}
      </Button>
    </div>
  );
};

export const FormNetworkSecurityStep = (props: FormStepProps) => {
  const { data, isLoading } = useQuery(
    ['network-step', props.offering.scope_uuid],
    () => {
      return Promise.all([
        loadSubnets({ tenant_uuid: props.offering.scope_uuid }),
        loadFloatingIps({
          tenant_uuid: props.offering.scope_uuid,
          free: true,
          field: ['url', 'address'],
        }),
      ]).then(([subnets, floatingIps]) => ({
        subnets,
        floatingIps,
      }));
    },
    { staleTime: 3 * 60 * 1000 },
  );

  return (
    <VStepperFormStepCard
      title={translate('Network and security')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <div className="mb-5 mt-n4 border-bottom">
        <FormSSHPublicKeysField
          change={props.change}
          cardBordered={false}
          minHeight="auto"
          headerClassName="mx-0"
          titleClassName="fs-6 text-gray-700"
        />
      </div>

      <Form.Group className="mb-2 border-bottom">
        <Form.Label className="fs-6 fw-bolder mb-5">
          {translate('Network')}
        </Form.Label>
        <FieldArray
          name="attributes.networks"
          component={renderNetworkRows}
          {...data}
        />
      </Form.Group>
      <FormSecurityGroupsField
        offering={props.offering}
        change={props.change}
        cardBordered={false}
        minHeight="auto"
        headerClassName="mx-0"
        titleClassName="fs-6 text-gray-700"
      />
    </VStepperFormStepCard>
  );
};
