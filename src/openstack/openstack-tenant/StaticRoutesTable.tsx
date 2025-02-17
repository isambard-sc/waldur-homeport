import { Plus, Trash } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { validateIPv4 } from '../utils';

export interface StaticRoute {
  destination: string;
  nexthop: string;
}

const validateFixedIPs = (fixedIps: string[]) => (value) => {
  if (fixedIps.includes(value)) {
    return translate('IP address is already used by router.');
  }
};

const ValidatedInputField = renderValidationWrapper(InputField);

const StaticRouteRow = ({ route, nexthopValidator, onRemove }) => (
  <tr>
    <td>
      <Field
        name={`${route}.destination`}
        component={ValidatedInputField}
        validate={required}
      />
    </td>
    <td>
      <Field
        name={`${route}.nexthop`}
        component={ValidatedInputField}
        validate={nexthopValidator}
      />
    </td>
    <td>
      <Button variant="default" onClick={onRemove} size="sm">
        <span className="svg-icon svg-icon-2">
          <Trash />
        </span>{' '}
        {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const StaticRouteAddButton = ({ onClick }) => (
  <Button variant="default" onClick={onClick} size="sm">
    <span className="svg-icon svg-icon-2">
      <Plus />
    </span>{' '}
    {translate('Add route')}
  </Button>
);

export const StaticRoutesTable: FC<{ fields; fixedIps: string[] }> = ({
  fields,
  fixedIps = [],
}) => {
  const nexthopValidator = useMemo(
    () => [required, validateIPv4, validateFixedIPs(fixedIps)],
    [fixedIps],
  );

  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table
            responsive={true}
            bordered={true}
            striped={true}
            className="mt-3"
          >
            <thead>
              <tr>
                <th>{translate('Destination (CIDR)')}</th>
                <th>{translate('Next hop (IP)')}</th>
                <th>{translate('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {fields.map((route, index) => (
                <StaticRouteRow
                  key={route}
                  route={route}
                  nexthopValidator={nexthopValidator}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </tbody>
          </Table>
          <StaticRouteAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <StaticRouteAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
