import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <ActionsDropdownComponent labeled={props.labeled} drop={props.drop}>
    <ActionsPopover {...props} />
  </ActionsDropdownComponent>
);
