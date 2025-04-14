import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { FieldEditButton } from './offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from './offerings/update/integration/types';

export const UserSecretOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const canCreateUser =
    props.offering.plugin_options?.service_provider_can_create_offering_user;

  return (
    <FormTable.Item
      label={translate('Shared user password')}
      value={props.offering.secret_options?.shared_user_password || 'N/A'}
      description={translate(
        'If defined, will be set as a password for all offering users',
      )}
      disabled={!canCreateUser}
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name="secret_options.shared_user_password"
          callback={props.callback}
          fieldComponent={StringField}
        />
      }
    />
  );
};
