import { get } from 'lodash-es';
import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { NumberField, StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
  {
    label: translate('Instance name'),
    key: 'service_attributes.instance_name',
    description: translate('Full path name to the OpenPortal Remote Agent that manages this instance'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Project template'),
    key: 'service_attributes.project_template',
    description: translate('Name of the OpenPortal Remote Project Template in which remote projects will be created'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Allocation units'),
    key: 'service_attributes.allocation_unit',
    description: translate('The unit of allocation for this instance, e.g. NHR'),
    component: StringField,
    fieldProps: { required: false, validate: required },
  },
  {
    label: translate('Default allocation'),
    key: 'service_attributes.default_allocation',
    description: translate('Default allocation in the above allocation units for projects using this resource. Leave empty for no default allocation.'),
    component: NumberField,
    fieldProps: { required: false, validate: required },
  }
];

export const OpenPortalRemoteForm: FunctionComponent<OfferingEditPanelFormProps> = (
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
          title={field.label}
          scope={props.offering}
          name={field.key}
          callback={props.callback}
          fieldComponent={field.component}
          fieldProps={field.fieldProps}
        />
      }
    />
  ));
