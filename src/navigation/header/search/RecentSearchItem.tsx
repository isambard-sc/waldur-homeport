import {
  ArrowClockwise,
  Buildings,
  ClipboardText,
  SquaresFour,
} from '@phosphor-icons/react';

import { Link } from '@waldur/core/Link';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';

import { getResourceFilterFromSearchItem } from './utils';

export const RecentSearchItem = ({ item }) => {
  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  if (!item.to) return null;

  return (
    <Link
      className="d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-primary-50"
      state={item.to}
      params={item.params}
      onClick={() => {
        syncResourceFilters(getResourceFilterFromSearchItem(item));
        close();
      }}
    >
      {item.type === 'organization' ? (
        <Buildings size={22} weight="bold" className="text-gray-700 me-4" />
      ) : item.type === 'project' ? (
        <ClipboardText size={22} weight="bold" className="text-gray-700 me-4" />
      ) : (
        <SquaresFour size={22} weight="bold" className="text-gray-700 me-4" />
      )}
      <span className="fs-6 fw-semibold flex-grow-1">{item.title}</span>
      <ArrowClockwise size={20} className="text-dark" />
    </Link>
  );
};
