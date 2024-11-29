import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { UserDetails } from '@waldur/workspace/types';

interface RowProps {
  user: UserDetails;
  label: string;
  value: string;
  description?: string;
  requiredMsg?: string | null;
  protected?: boolean;
  protectedMsg?: string;
  name: string;
  actions?: React.ReactNode;
}

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const UserEditRow = (props: RowProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: props,
        size: 'sm',
      }),
    );
  };
  const tooltip = props.protected
    ? props.protectedMsg
      ? props.protectedMsg
      : props.user.identity_provider_label
        ? translate('Information is coming from {identityProvider}', {
          identityProvider: props.user.identity_provider_label,
        })
        : translate('Information is coming from identity provider')
    : undefined;

  return (
    <FormTable.Item
      label={props.label}
      description={props.description}
      value={props.value || '—'}
      warnTooltip={props.requiredMsg}
      actions={
        props.actions || (
          <ActionButton
            action={callback}
            iconNode={<PencilSimple weight="bold" />}
            variant="secondary"
            className="btn-sm btn-icon"
            disabled={props.protected}
            tooltip={tooltip}
            data-testid={`user-edit-row-${props.name}`}
          />
        )
      }
    />
  );
};
