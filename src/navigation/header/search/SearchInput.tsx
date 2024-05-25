import { CaretDown, MagnifyingGlass, X } from '@phosphor-icons/react';
import classNames from 'classnames';

import { translate } from '@waldur/i18n';

import { SearchResult } from './useSearch';

interface SearchProps {
  result: SearchResult;
  query: string;
  setQuery;
  hasFilters?: boolean;
  className?: string;
}

const hiddenStyle = {
  display: 'none',
};

export const SearchInput = ({
  result,
  query,
  setQuery,
  hasFilters,
  className,
}: SearchProps) => {
  const isLoading = result.isLoading || result.isRefetching;

  return (
    <div className={className}>
      <form className="w-100 position-relative" autoComplete="off">
        <input style={hiddenStyle} type="text" name="fakeusernameremembered" />
        <input
          style={hiddenStyle}
          type="password"
          name="fakepasswordremembered"
        />
        <span className="position-absolute top-50 translate-middle-y ms-4">
          <MagnifyingGlass weight="bold" size={18} className="text-gray-700" />
        </span>
        <input
          type="text"
          className="search-input form-control ps-13 fs-4"
          name="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={translate('Search...')}
        />
        <span
          className={classNames(
            'position-absolute top-50 end-0 translate-middle-y lh-0 me-4',
            isLoading ? '' : 'd-none',
          )}
        >
          <span className="spinner-border h-15px w-15px align-middle text-gray-700" />
        </span>
        <button
          type="button"
          className={classNames(
            'btn btn-flush btn-active-color-primary position-absolute top-50 end-0 translate-middle-y lh-0 me-4',
            !isLoading && query ? '' : 'd-none',
          )}
          onClick={() => setQuery('')}
        >
          <X weight="bold" size={16} className="text-gray-700" />
        </button>

        {/* Filters toggle */}
        {hasFilters && (
          <div
            className={classNames(
              'position-absolute top-50 end-0 translate-middle-y',
              !isLoading && !query ? '' : 'd-none',
            )}
            data-kt-search-element="toolbar"
          >
            <button
              type="button"
              data-kt-search-element="advanced-options-form-show"
              className="btn btn-icon w-20px btn-sm btn-active-color-primary"
              data-bs-toggle="tooltip"
              title="Show more search options"
            >
              <CaretDown size={30} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
