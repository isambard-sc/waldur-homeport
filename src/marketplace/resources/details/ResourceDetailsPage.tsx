import { FC } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { Resource } from '../types';

interface OwnProps {
  data: {
    resource: Resource;
    resourceScope: any;
    offering: Offering;
  };
  refetch;
  isLoading;
  error;
  tabSpec;
}

export const ResourceDetailsPage: FC<OwnProps> = (props) => {
  const data = props.data;

  if (props.isLoading) {
    return <LoadingSpinner />;
  }
  if (props.error) {
    return <h3>{translate('Unable to load resource details.')}</h3>;
  }
  if (!data || !props.tabSpec) {
    return null;
  }

  return (
    <props.tabSpec.component
      resource={data.resource}
      resourceScope={data.resourceScope}
      offering={data.offering}
      title={props.tabSpec.title}
      refetch={props.refetch}
    />
  );
};
