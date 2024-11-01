import { FunctionComponent } from 'react';

import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
  hasMultiSelect?: boolean;
}

export const ResourceSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const conf = ResourceSummaryRegistry.get(props.resource.resource_type);
  const SummaryComponent = conf?.component;
  if (conf?.standalone) {
    return <SummaryComponent resource={props.resource} />;
  } else {
    return (
      <ExpandableContainer hasMultiSelect={props.hasMultiSelect} asTable>
        <ResourceSummaryBase resource={props.resource} />
        {SummaryComponent && <SummaryComponent resource={props.resource} />}
      </ExpandableContainer>
    );
  }
};
