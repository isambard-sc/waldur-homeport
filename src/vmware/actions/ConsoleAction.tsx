import { vmwareVirtualMachineConsoleRetrieve } from 'waldur-js-client';

import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleActionItem } from '@waldur/resource/actions/OpenConsoleActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK')];

export const ConsoleAction: ActionItemType = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={(id) =>
      vmwareVirtualMachineConsoleRetrieve({ path: { uuid: id } }).then(
        (response) => response.data.url,
      )
    }
    validators={validators}
    resource={resource}
  />
);
