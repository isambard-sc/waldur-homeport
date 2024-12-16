import { get } from 'lodash-es';
import { FunctionComponent, useMemo } from 'react';

import { NumberField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

export const OpenStackPluginOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const fields = useMemo(
    () =>
      [
        {
          label: translate('Default internal network MTU'),
          key: 'plugin_options.default_internal_network_mtu',
          component: NumberField,
        },
        props.offering.plugin_options?.storage_mode == 'dynamic' && {
          label: translate('Snapshot size limit'),
          key: 'plugin_options.snapshot_size_limit_gb',
          component: NumberField,
          description: translate(
            'Additional space to apply to storage quota to be used by snapshots.',
          ),
          fieldProps: { unit: 'GB' },
        },
        {
          label: translate('Maximum number of instances in a single tenant'),
          key: 'plugin_options.max_instances',
          component: NumberField,
        },
        {
          label: translate('Maximum number of volumes in a single tenant'),
          key: 'plugin_options.max_volumes',
          component: NumberField,
        },
      ].filter(Boolean),
    [props],
  );

  return fields.map((field) => (
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
};
