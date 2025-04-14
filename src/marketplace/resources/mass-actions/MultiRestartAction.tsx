import { ArrowClockwise } from '@phosphor-icons/react';

import { getProps } from '@waldur/openstack/openstack-instance/actions/RestartAction';

import { VirtualMachineMultiAction } from './VirtualMachineMultiAction';

export const MultiRestartAction = ({ rows, refetch }) => (
  <VirtualMachineMultiAction
    iconNode={<ArrowClockwise weight="bold" />}
    {...getProps()}
    rows={rows}
    refetch={refetch}
  />
);
