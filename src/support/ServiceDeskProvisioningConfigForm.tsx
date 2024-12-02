import { FC } from 'react';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

export const ServiceDeskProvisioningConfigForm: FC<
  OfferingEditPanelFormProps
> = (props) => (
  <>
    <FormTable.Item
      label={translate('Confirmation notification template')}
      value={
        props.offering.secret_options?.template_confirmation_comment || 'N/A'
      }
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name="secret_options.template_confirmation_comment"
          callback={props.callback}
          fieldComponent={TextField}
        />
      }
    />
    <FormTable.Item
      label={translate('Enable issues for membership changes')}
      value={
        <CheckOrX
          value={
            props.offering.plugin_options?.enable_issues_for_membership_changes
          }
        />
      }
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name="plugin_options.enable_issues_for_membership_changes"
          callback={props.callback}
          fieldComponent={AwesomeCheckboxField}
          hideLabel
        />
      }
    />
  </>
);
