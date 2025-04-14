import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';

const ResourceComponentsDialog = lazyComponent(() =>
  import('./ResourceComponentsDialog').then((module) => ({
    default: module.ResourceComponentsDialog,
  })),
);

const showResourceComponentsDialog = (resource, components) =>
  openModalDialog(ResourceComponentsDialog, {
    resolve: { resource, components },
    size: 'lg',
  });

export const ResourceShowMoreComponents = ({
  resource,
  components,
}: {
  resource: Pick<Resource, 'current_usages' | 'limits' | 'limit_usage'>;
  components: OfferingComponent[];
}) => {
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      className="text-anchor fw-bold"
      onClick={() =>
        dispatch(showResourceComponentsDialog(resource, components))
      }
    >
      {translate('Show more')}
    </button>
  );
};
