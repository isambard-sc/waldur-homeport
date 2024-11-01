import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ProviderProjectResourcesDialog = lazyComponent(
  () => import('./ProviderProjectResourcesDialog'),
  'ProviderProjectResourcesDialog',
);

export const ResourcesColumn = ({ row, provider_uuid }) => {
  const dispatch = useDispatch();

  return (
    <button
      className="btn btn-link"
      onClick={() =>
        dispatch(
          openModalDialog(ProviderProjectResourcesDialog, {
            resolve: {
              project_uuid: row.uuid,
              provider_uuid,
            },
            size: 'lg',
          }),
        )
      }
    >
      {translate('{count} resources', {
        count: row.resources_count || 0,
      })}
    </button>
  );
};
