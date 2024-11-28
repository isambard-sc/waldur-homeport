import { Button } from 'react-bootstrap';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

import { Resource } from '../types';

import { ResourceSummaryProps } from './types';

const ResourceMetadataDialog = lazyComponent(() =>
  import('./ResourceMetadataDialog').then((module) => ({
    default: module.ResourceMetadataDialog,
  })),
);

export const ResourceMetadataLink = <T extends Resource = any>(
  props: ResourceSummaryProps<T>,
) => {
  const { openDialog } = useModal();
  return (
    <Button
      variant="link"
      className="btn-flush"
      onClick={() =>
        openDialog(ResourceMetadataDialog, {
          resolve: props,
          size: 'lg',
        })
      }
    >
      {translate('Show')}
    </Button>
  );
};
