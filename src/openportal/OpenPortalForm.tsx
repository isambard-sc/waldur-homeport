import { get } from 'lodash-es';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
  {
    label: translate('Instance name'),
    key: 'service_attributes.instance_name',
    description: translate('Full path name to the OpenPortal Agent that manages this instance'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
];

export const OpenPortalForm: FunctionComponent<OfferingEditPanelFormProps> = (
  props,
) =>
  fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      description={field.description}
      value={get(props.offering, field.key, 'N/A')}
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name={field.key}
          callback={props.callback}
          fieldComponent={field.component}
          fieldProps={field.fieldProps}
        />
      }
    />
  ));
