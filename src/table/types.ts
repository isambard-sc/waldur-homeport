import { AxiosRequestConfig } from 'axios';
import React, { ReactNode } from 'react';
import { ColProps } from 'react-bootstrap';
import { BaseFieldProps } from 'redux-form';

import { TableFiltersGroup } from './TableFilterService';

interface RequestConfigExtended extends AxiosRequestConfig {
  staleTime?: number;
}

export interface TableRequest {
  pageSize: number;
  currentPage: number;
  filter?: any;
  query?: string;
  sortField?: string;
  sortOrder?: boolean;
  options?: RequestConfigExtended;
}

export interface StateTables {
  tables: { [key: string]: TableState };
}

interface TableResponse<RowType = any> {
  rows: RowType[];
  resultCount: number;
  nextPage: number;
}

export type Fetcher = <RowType = any>(
  request: TableRequest,
) => Promise<TableResponse<RowType>>;

export interface TableOptionsType<RowType = any> {
  table: string;
  fetchData: any;
  onFetch?: (rows: RowType[], totalCount: number, firstFetch: boolean) => void;
  onApplyFilter?: (filters: FilterItem[]) => void;
  staleTime?: number;
  queryField?: string;
  exportFields?: string[] | ((props: any) => string[]);
  exportKeys?: string[];
  exportData?: (rows: RowType[], props: any) => string[][];
  exportRow?: (row: RowType, props: any) => string[];
  placeholderComponent?: React.ComponentType;
  pullInterval?: number | (() => number);
  filters?: React.ReactNode;
  filter?;
  mandatoryFields?: string[];
}

export interface Column<RowType = any> {
  id?: string;
  title: ReactNode;
  render: React.ComponentType<{ row: RowType }>;
  className?: string;
  orderField?: string;
  visible?: boolean;
  copyField?: (row: RowType) => string | number;
  /** The keys that are required for optional columns to be fetched. */
  keys?: string[];
  optional?: boolean;
  filter?: string;
  export?: string | boolean | ((row: RowType) => string | number);
  exportTitle?: string;
  exportKeys?: string[];
  disabledClick?: boolean;
}

export type DisplayMode = 'table' | 'grid';

export type FilterPosition = 'menu' | 'sidebar' | 'header';

export interface Pagination {
  resultCount: number;
  currentPage: number;
  pageSize: number;
}

export interface FilterItem {
  label: string;
  name: string;
  value: any;
  component: () => JSX.Element;
}

export interface TableState {
  entities?: Record<string, any>;
  order?: string[];
  loading?: boolean;
  error?: any;
  mode?: DisplayMode;
  pagination?: Pagination;
  query?: string;
  sorting?: SortingState;
  filterPosition?: FilterPosition;
  filtersStorage?: FilterItem[];
  savedFilters?: TableFiltersGroup[];
  selectedSavedFilter?: TableFiltersGroup;
  /** Don't apply the filters at first (let's set it `false`), because the filters are empty and the request will be invalid. \
   * Therefore, in the next renders, this variable will be changed to `true` to read the actual filters. */
  applyFilters?: boolean;
  toggled?: Record<string, boolean>;
  selectedRows?: any[];
  firstFetch?: boolean;
  activeColumns: Record<string, boolean>;
  columnPositions: string[];
}

export interface Sorting {
  field: string;
  mode: undefined | 'asc' | 'desc';
}

interface SortingState extends Sorting {
  loading?: boolean;
}

export interface TableDropdownItem {
  label: string;
  iconNode?: ReactNode;
  action?: () => void;
  children?: Array<{
    label: string;
    iconNode?: ReactNode;
    action: () => void;
  }>;
  isMobileAction?: boolean;
}

export type DropdownActionItemType<T = any> = React.ComponentType<{
  row?: T;
  refetch?(): void;
  as?: React.ComponentType;
}>;

export interface TableProps<RowType = any> extends TableState {
  table?: string;
  rows: any[];
  rowKey?: string;
  fetch: (force?: boolean) => void;
  gotoPage?: (page: number) => void;
  hasQuery?: boolean;
  setQuery?: (query: string) => void;
  setFilter?: (item: FilterItem) => void;
  applyFiltersFn?: (apply: boolean) => void;
  setFilterPosition?: (filterPosition: FilterPosition) => void;
  columns?: Array<Column<RowType>>;
  setDisplayMode?: (mode: DisplayMode) => void;
  gridItem?: React.ComponentType<{ row: RowType }>;
  gridSize?: ColProps;
  openFiltersDrawer?: (filters: React.ReactNode) => void;
  renderFiltersDrawer?: (filters: React.ReactNode) => void;
  dropdownActions?: TableDropdownItem[];
  tableActions?: React.ReactNode;
  verboseName?: string;
  className?: string;
  id?: string;
  rowClass?: (({ row }) => string) | string;
  hoverable?: boolean;
  minHeight?: number;
  cardBordered?: boolean;
  showPageSizeSelector?: boolean;
  updatePageSize?: (size: number) => void;
  initialPageSize?: number;
  resetPagination?: () => void;
  hasPagination?: boolean;
  sortList?(sorting: Sorting): void;
  initialSorting?: Sorting;
  expandableRow?: React.ComponentType<{ row: any }>;
  expandableRowClassName?: string;
  rowActions?: React.ComponentType<{ row; fetch }>;
  toggleRow?(row: any): void;
  toggled?: Record<string, boolean>;
  enableExport?: boolean;
  showExportInDropdown?: boolean;
  placeholderComponent?: React.ReactNode;
  placeholderActions?: React.ReactNode;
  filters?: JSX.Element;
  title?: React.ReactNode;
  alterTitle?: React.ReactNode;
  hasActionBar?: boolean;
  hasHeaders?: boolean;
  enableMultiSelect?: boolean;
  multiSelectActions?: React.ComponentType<{ rows: any[]; refetch }>;
  selectRow?(row: any): void;
  selectAllRows?(rows: any[]): void;
  resetSelection?: () => void;
  filter?: Record<string, any>;
  fieldType?: 'checkbox' | 'radio';
  fieldName?: string;
  validate?: BaseFieldProps['validate'];
  footer?: React.ReactNode;
  /** If enabled, set `keys` and `id` for each column. Also pass the required keys separately. */
  hasOptionalColumns?: boolean;
  toggleColumn?(id, column, value?): void;
  initColumnPositions?(ids: string[]): void;
  swapColumns?(column1: string, column2: string): void;
  initialMode?: 'grid' | 'table';
  standalone?: boolean;
  hideClearFilters?: boolean;
}
