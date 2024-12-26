import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { BreadcrumbDropdown } from '@waldur/navigation/header/breadcrumb/BreadcrumbDropdown';
import { useFavoritePages } from '@waldur/navigation/header/favorite-pages/FavoritePageService';
import { SearchItem } from '@waldur/navigation/header/search/SearchItem';

import { ServiceProvider } from '../types';

const OfferingRow = ({
  row,
  addFavoritePage,
  removeFavorite,
  isFavorite,
  page,
  close,
}) => (
  <SearchItem
    to={
      page === 'edit'
        ? 'marketplace-offering-update'
        : 'marketplace-offering-details'
    }
    params={{ offering_uuid: row.uuid }}
    image={row.thumbnail}
    title={row.name}
    subtitle={row.category_title}
    addFavoritePage={addFavoritePage}
    removeFavorite={removeFavorite}
    isFavorite={isFavorite}
    onClick={close}
  />
);

interface OfferingBreadcrumbPopoverProps {
  provider: ServiceProvider;
  close(): void;
  page: 'details' | 'edit';
}

export const OfferingBreadcrumbPopover = ({
  provider,
  close,
  page,
}: OfferingBreadcrumbPopoverProps) => {
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();

  return (
    <BreadcrumbDropdown
      api={fixURL(`/marketplace-service-providers/${provider.uuid}/offerings/`)}
      queryField="name"
      params={{
        field: ['name', 'uuid', 'category_title', 'thumbnail'],
      }}
      RowComponent={({ row }) => (
        <OfferingRow
          row={row}
          addFavoritePage={addFavoritePage}
          removeFavorite={removeFavorite}
          isFavorite={isFavorite}
          page={page}
          close={close}
        />
      )}
      placeholder={translate('Type in name of offering') + '...'}
      emptyMessage={translate('There are no offerings.')}
    />
  );
};
