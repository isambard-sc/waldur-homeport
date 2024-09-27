import { translate } from '@waldur/i18n';
import { KeyValueButton } from '@waldur/marketplace/resources/KeyValueButton';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

import { NodeRoleField } from './NodeRoleField';

const formatInstance = (resource) =>
  resource.instance_marketplace_uuid ? (
    <ResourceLink
      uuid={resource.instance_marketplace_uuid}
      label={resource.instance_name}
    />
  ) : (
    <>&ndash;</>
  );

export const RancherNodeSummary = (props: ResourceSummaryProps) => {
  return (
    <>
      <Field
        label={translate('Kubernetes version')}
        value={props.resource.k8s_version}
      />
      <Field
        label={translate('Roles')}
        value={<NodeRoleField node={props.resource} />}
      />
      <Field
        label={translate('Docker version')}
        value={props.resource.docker_version}
      />
      <Field
        label={translate('CPU')}
        value={
          props.resource.cpu_allocated &&
          `${props.resource.cpu_allocated} / ${props.resource.cpu_total} cores`
        }
      />
      <Field
        label={translate('RAM')}
        value={
          props.resource.ram_total &&
          `${props.resource.ram_allocated} / ${props.resource.ram_total} GiB`
        }
      />
      <Field
        label={translate('Pods')}
        value={
          props.resource.pods_total &&
          `${props.resource.pods_allocated} / ${props.resource.pods_total}`
        }
      />
      <Field
        label={translate('Labels')}
        value={
          Object.keys(props.resource.labels).length > 0 && (
            <KeyValueButton
              items={props.resource.labels}
              title={translate('Labels')}
            />
          )
        }
      />
      <Field
        label={translate('Annotations')}
        value={
          Object.keys(props.resource.annotations).length > 0 && (
            <KeyValueButton
              items={props.resource.annotations}
              title={translate('Annotations')}
            />
          )
        }
      />
      <Field
        label={translate('OpenStack instance')}
        value={formatInstance(props.resource)}
      />
    </>
  );
};
