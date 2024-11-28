import { Trash } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { deleteCatalog } from '../api';

export const CatalogDeleteButton: FunctionComponent<{ catalog; refetch }> = ({
  catalog,
  refetch,
}) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete catalog'),
        translate(
          'Are you sure you would like to delete Rancher catalog {catalog}?',
          { catalog: <strong>{catalog.name}</strong> },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await deleteCatalog(catalog.uuid);
      await refetch();
      dispatch(showSuccess(translate('Catalog has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete catalog.')));
    }
    setRemoving(false);
  };
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <RowActionButton
      title={translate('Delete')}
      action={callback}
      iconNode={<Trash />}
      size="sm"
      pending={removing}
    />
  );
};
