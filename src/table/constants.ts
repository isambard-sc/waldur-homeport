import { type TableState } from './types';

export const DASH_ESCAPE_CODE = '\u2014';
export const OPTIONAL_COLUMN_ACTIONS_KEY = '__actions__';
export const COLUMN_FILTER_TOGGLE_CLASS = 'column-filter-toggle';
export const MIN_PAGE_SIZE = 5;

export const INITIAL_STATE: TableState = {
  entities: {},
  order: [],
  loading: false,
  error: null,
  mode: 'table',
  pagination: {
    pageSize: 10,
    resultCount: 0,
    currentPage: 1,
  },
  sorting: {
    mode: undefined,
    field: null,
    loading: false,
  },
  filterPosition: 'menu',
  filtersStorage: [],
  savedFilters: [],
  selectedSavedFilter: null,
  applyFilters: false,
  toggled: {},
  selectedRows: [],
  firstFetch: true,
  activeColumns: {},
  columnPositions: [],
};
