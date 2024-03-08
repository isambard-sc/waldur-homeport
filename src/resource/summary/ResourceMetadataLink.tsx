import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { Resource } from '../types';

import { ResourceSummaryProps } from './types';

const ResourceMetadataDialog = lazyComponent(
  () => import('./ResourceMetadataDialog'),
  'ResourceMetadataDialog',
);

const openDetailsDialog = (props) =>
  openModalDialog(ResourceMetadataDialog, {
    resolve: props,
    size: 'lg',
  });

export const ResourceMetadataLink = <T extends Resource = any>(
  props: ResourceSummaryProps<T>,
) => {
  const dispatch = useDispatch();
  return (
    <button
      type="button"
      className="text-btn text-dark"
      onClick={() => dispatch(openDetailsDialog(props))}
    >
      {translate('Show')}
    </button>
  );
};
