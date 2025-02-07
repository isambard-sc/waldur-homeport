import { Question } from '@phosphor-icons/react';

import { formatRelative } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { formatSummary } from '@waldur/resource/utils';

import { IPList } from '../IPList';

import { Field } from './Field';
import { ResourceSummaryProps } from './types';

const formatUptime = (props) =>
  props.resource.start_time ? formatRelative(props.resource.start_time) : null;

export const ResourceSummaryField = ({ resource }) => (
  <>
    {formatSummary(resource)}
    {resource.flavor_name && (
      <Tip
        id="resourceSummary"
        label={translate('Flavor name: {flavor_name}', {
          flavor_name: resource.flavor_name,
        })}
      >
        {' '}
        <Question size={17} />
      </Tip>
    )}
  </>
);

export const PureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  return (
    <>
      <Field
        label={translate('Summary')}
        value={<ResourceSummaryField {...props} />}
      />
      <Field
        label={translate('Internal IP')}
        value={<IPList value={props.resource.internal_ips} />}
      />
      <Field
        label={translate('Floating IP')}
        value={<IPList value={props.resource.external_ips} />}
      />
      <Field
        label={translate('External IPs')}
        value={<IPList value={props.resource.external_address} />}
      />
      <Field
        label={translate('SSH key')}
        value={props.resource.key_name}
        helpText={props.resource.key_fingerprint}
        hasCopy
      />
      <Field label={translate('Uptime')} value={formatUptime(props)} />
    </>
  );
};
