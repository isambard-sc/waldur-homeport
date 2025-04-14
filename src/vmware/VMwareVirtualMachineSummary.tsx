import { VmwareVirtualMachine } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { formatSummary } from '@waldur/resource/utils';

export const VMwareVirtualMachineSummary = (
  props: ResourceSummaryProps<VmwareVirtualMachine>,
) => {
  const { resource } = props;
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;
  return (
    <>
      <Field label={translate('Summary')} value={formatSummary(resource)} />
      <Field label={translate('Guest OS')} value={resource.guest_os_name} />
      <Field label={translate('VMware Tools')} value={resource.tools_state} />
      {advancedMode && (
        <>
          <Field label={translate('Template')} value={resource.template_name} />
          <Field label={translate('Cluster')} value={resource.cluster_name} />
          <Field
            label={translate('Datastore')}
            value={resource.datastore_name}
          />
        </>
      )}
    </>
  );
};
