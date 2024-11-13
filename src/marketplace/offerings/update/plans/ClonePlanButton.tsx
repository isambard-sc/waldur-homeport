import { Copy } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ADD_PLAN_FORM_ID } from './constants';

const ClonePlanDialog = lazyComponent(() =>
  import('./AddPlanDialog').then((module) => ({
    default: module.AddPlanDialog,
  })),
);

export const ClonePlanButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(ClonePlanDialog, {
        resolve: { offering, plan, refetch },
        formId: ADD_PLAN_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <Dropdown.Item onClick={callback}>
      <Copy size={18} /> {translate('Clone')}
    </Dropdown.Item>
  );
};
