import { Trash } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FormSection, WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/openstack/openstack-instance/actions/update-floating-ips/SelectField';
import { RootState } from '@waldur/store/reducers';

import {
  BackupFormChoices,
  hasFreeSubnets,
  getFreeSubnets,
  getFreeFloatingIps,
  getAllNetworksSelector,
  getNetworkSelector,
  SKIP_FLOATING_IP_ASSIGNMENT,
} from './utils';

type NetworkChoices = Pick<BackupFormChoices, 'subnets' | 'floatingIps'>;

const AddButton = ({ onClick, disabled }) => (
  <Button variant="default" onClick={onClick} disabled={disabled}>
    <i className="fa fa-plus" /> {translate('Add')}
  </Button>
);

const DeleteButton = ({ onClick }) => (
  <Button variant="default" title={translate('Delete')} onClick={onClick}>
    <span className="svg-icon svg-icon-2">
      <Trash />
    </span>
  </Button>
);

const NetworkRow: FC<NetworkChoices & { name: string; onDelete(): void }> = ({
  name,
  subnets,
  floatingIps,
  onDelete,
}) => {
  const network = useSelector((state: RootState) =>
    getNetworkSelector(name)(state),
  );
  const networks = useSelector(getAllNetworksSelector);
  const freeSubnets = useMemo(
    () => getFreeSubnets(subnets, networks, network),
    [subnets, networks, network],
  );
  const freeFloatingIps = useMemo(
    () => getFreeFloatingIps(floatingIps, networks, network),
    [floatingIps, networks, network],
  );
  return (
    <tr>
      <td className="ps-0 col-md-6">
        <SelectField name="subnet" options={freeSubnets} />
      </td>
      <td className="col-md-5">
        <SelectField
          options={freeFloatingIps}
          name="floating_ip"
          disabled={!network.subnet}
        />
      </td>
      <td className="pe-0">
        <DeleteButton onClick={onDelete} />
      </td>
    </tr>
  );
};

export const NetworksList: FC<WrappedFieldArrayProps & NetworkChoices> = ({
  fields,
  subnets,
  floatingIps,
}) => {
  const networks = useSelector(getAllNetworksSelector);
  const addDisabled = useMemo(
    () => !hasFreeSubnets(subnets, networks),
    [subnets, networks],
  );
  return (
    <>
      <table className="table table-borderless mb-1">
        <tbody>
          {fields.map((field, index) => (
            <FormSection key={index} name={field}>
              <NetworkRow
                name={field}
                subnets={subnets}
                floatingIps={floatingIps}
                onDelete={() => fields.remove(index)}
              />
            </FormSection>
          ))}
        </tbody>
      </table>
      <AddButton
        onClick={() => {
          fields.push({ floating_ip: SKIP_FLOATING_IP_ASSIGNMENT });
        }}
        disabled={addDisabled}
      />
    </>
  );
};
