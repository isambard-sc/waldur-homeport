import { FunctionComponent } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

import { OpenStackExternalIpsField } from './OpenStackExternalIpsField';

export const OpenStackSecretOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const items: Array<{ floating_ip; external_ip }> =
    props.offering.secret_options?.ipv4_external_ip_mapping;

  return (
    <FormTable.Item
      label={translate('Mapping of floating to external IPs')}
      value={
        items ? (
          <div className="text-pre">
            {items
              .map((item) => `${item.floating_ip}: ${item.external_ip}`)
              .join('\n')}
          </div>
        ) : (
          'N/A'
        )
      }
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name="secret_options.ipv4_external_ip_mapping"
          callback={props.callback}
          fieldComponent={OpenStackExternalIpsField}
        />
      }
    />
  );
};
