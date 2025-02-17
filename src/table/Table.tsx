import { ErrorBoundary } from '@sentry/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, { useEffect, useMemo, useRef } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { titleCase } from '@waldur/core/utils';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { ErrorView } from '@waldur/ErrorView';

import { OPTIONAL_COLUMN_ACTIONS_KEY } from './constants';
import { FilterContextProvider } from './FilterContextProvider';
import { GridBody } from './GridBody';
import { HiddenActionsMessage } from './HiddenActionsMessage';
import { TableBody } from './TableBody';
import { TableButtons } from './TableButtons';
import { TableFilterContainer } from './TableFilterContainer';
import { TableFilters } from './TableFilters';
import { TableHeader } from './TableHeader';
import { TableLoadingSpinnerContainer } from './TableLoadingSpinnerContainer';
import { TablePagination } from './TablePagination';
import { TablePlaceholder } from './TablePlaceholder';
import { TableQuery } from './TableQuery';
import { TableRefreshButton } from './TableRefreshButton';
import { TableProps } from './types';
import { useTableLoader } from './useTableLoader';

import './Table.scss';

const TableComponent = (
  props: TableProps & { toggleFilterMenu?(show?): void },
) => {
  const visibleColumns = useMemo(
    () =>
      props.hasOptionalColumns
        ? props.columns.filter(
            (column) => !column.keys || props.activeColumns[column.id],
          )
        : props.columns,
    [props.activeColumns, props.columns],
  );

  const showActions = useMemo(() => {
    if (props.rowActions && !props.hasOptionalColumns) return true;
    return Boolean(props.activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY]);
  }, [props.rowActions, props.hasOptionalColumns, props.activeColumns]);

  return (
    <table
      className={classNames(
        'table align-middle table-row-bordered fs-6 gy-0 no-footer',
        {
          'table-expandable': Boolean(props.expandableRow),
          'table-hover': props.hoverable,
        },
      )}
    >
      {props.hasHeaders && (
        <TableHeader
          rows={props.rows}
          onSortClick={props.sortList}
          currentSorting={props.sorting}
          columns={visibleColumns}
          expandableRow={!!props.expandableRow}
          showActions={showActions}
          enableMultiSelect={props.enableMultiSelect}
          onSelectAllRows={props.selectAllRows}
          selectedRows={props.selectedRows}
          fieldType={props.fieldType}
          filters={props.filters}
          filtersStorage={props.filtersStorage}
          setFilter={props.setFilter}
          applyFiltersFn={props.applyFiltersFn}
          columnPositions={props.columnPositions}
          hasOptionalColumns={props.hasOptionalColumns}
          toggleFilterMenu={props.toggleFilterMenu}
        />
      )}
      <TableBody
        rows={props.rows}
        columns={visibleColumns}
        rowClass={props.rowClass}
        rowKey={props.rowKey}
        expandableRow={props.expandableRow}
        expandableRowClassName={props.expandableRowClassName}
        rowActions={showActions ? props.rowActions : undefined}
        enableMultiSelect={props.enableMultiSelect}
        selectRow={props.selectRow}
        selectedRows={props.selectedRows}
        toggleRow={props.toggleRow}
        toggled={props.toggled}
        fetch={props.fetch}
        fieldType={props.fieldType}
        fieldName={props.fieldName}
        validate={props.validate}
        columnPositions={props.columnPositions}
        hasOptionalColumns={props.hasOptionalColumns}
      />
    </table>
  );
};

class TableClass<RowType = any> extends React.Component<TableProps<RowType>> {
  static defaultProps = {
    rows: [],
    columns: [],
    rowKey: 'uuid',
    hasQuery: false,
    hasPagination: true,
    hasActionBar: true,
    hasHeaders: true,
    cardBordered: true,
    hoverShadow: true,
  };

  state = {
    closedHiddenActionsMessage: false,
    /** Controls whether the main add filter toggle is displayed. \
     * Used with `filterPosition = 'menu'`*/
    showFilterMenuToggle: false,
  };

  constructor(props) {
    super(props);
    this.toggleFilterMenu = this.toggleFilterMenu.bind(this);
  }

  render() {
    const gridHover =
      (typeof this.props.hoverShadow === 'object'
        ? (this.props.hoverShadow.grid ?? true)
        : this.props.hoverShadow) && Boolean(this.props.gridItem);
    const tableHover =
      typeof this.props.hoverShadow === 'object'
        ? (this.props.hoverShadow.table ?? true)
        : this.props.hoverShadow;

    return (
      <FilterContextProvider
        {...this.props}
        toggleFilterMenu={this.toggleFilterMenu}
      >
        {this.props.standalone && (
          <div className="d-flex justify-content-between gap-4 mb-6">
            <Stack direction="horizontal" gap={2}>
              <h1 className="mb-0">
                {this.props.title || this.props.alterTitle}
              </h1>
              <TableRefreshButton {...this.props} />
            </Stack>
            <div className="d-none d-sm-flex gap-3">
              {this.props.tableActions}
            </div>
          </div>
        )}
        <Card
          className={classNames(
            'card-table',
            'full-width',
            this.props.cardBordered && 'card-bordered',
            this.props.fieldName ? 'field-table' : '',
            this.props.mode === 'grid' &&
              Boolean(this.props.gridItem) &&
              'grid-table',
            this.props.className,
          )}
          id={this.props.id}
        >
          {this.props.hasActionBar && (
            <Card.Header className="border-bottom">
              <Row className="card-toolbar g-0 gap-4 w-100">
                {!this.props.standalone && (
                  <Col xs className="order-0">
                    <Card.Title>
                      <div className="me-2">
                        <span className="h3">
                          {this.props.title ||
                            (this.props.verboseName &&
                              titleCase(this.props.verboseName)) ||
                            this.props.alterTitle}
                        </span>
                        {Boolean(this.props.subtitle) && (
                          <small className="fs-6 fw-normal d-block mt-2">
                            {this.props.subtitle}
                          </small>
                        )}
                      </div>
                      {!this.props.hideRefresh && (
                        <TableRefreshButton {...this.props} />
                      )}
                    </Card.Title>
                  </Col>
                )}
                <Col sm="auto" className="order-1 order-sm-2 ms-auto">
                  {this.showActionsColumn() && (
                    <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3">
                      <TableButtons
                        {...this.props}
                        showFilterMenuToggle={this.state.showFilterMenuToggle}
                        toggleFilterMenu={this.toggleFilterMenu}
                      />
                    </div>
                  )}
                </Col>
                {this.props.hasQuery && (
                  <Col
                    xs
                    className={classNames(
                      'order-2 order-sm-1 mw-lg-325px',
                      !this.props.standalone && 'ms-auto',
                    )}
                  >
                    {this.props.hasQuery && (
                      <TableQuery
                        query={this.props.query}
                        setQuery={this.props.setQuery}
                      />
                    )}
                  </Col>
                )}
              </Row>
            </Card.Header>
          )}

          {this.props.filterPosition === 'header' && this.props.filters ? (
            <Card.Header className="table-filter border-bottom align-items-stretch">
              <TableFilterContainer filters={this.props.filters} />
            </Card.Header>
          ) : null}

          {this.props.filters
            ? (this.props.filterPosition === 'menu' ||
                (this.props.filterPosition === 'sidebar' &&
                  this.props.filtersStorage.length > 0)) && (
                <Card.Header
                  className={classNames('border-bottom', {
                    'd-none':
                      !this.state.showFilterMenuToggle &&
                      this.props.filterPosition === 'menu',
                  })}
                >
                  <TableFilters
                    table={this.props.table}
                    filtersStorage={this.props.filtersStorage}
                    filters={this.props.filters}
                    renderFiltersDrawer={this.props.renderFiltersDrawer}
                    hideClearFilters={this.props.hideClearFilters}
                    filterPosition={this.props.filterPosition}
                    setFilter={this.props.setFilter}
                    applyFiltersFn={this.props.applyFiltersFn}
                    selectedSavedFilter={this.props.selectedSavedFilter}
                  />
                </Card.Header>
              )
            : null}

          {!this.state.closedHiddenActionsMessage &&
            this.props.hasOptionalColumns &&
            this.props.activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY] === false && (
              <Card.Header className="border-bottom">
                <HiddenActionsMessage
                  toggleColumn={this.props.toggleColumn}
                  close={() =>
                    this.setState({ closedHiddenActionsMessage: true })
                  }
                />
              </Card.Header>
            )}

          <Card.Body>
            <div
              className="table-responsive dataTables_wrapper"
              style={{ minHeight: this.props.minHeight || 300 }}
            >
              <div
                className={classNames(
                  'table-container',
                  tableHover && 'table-hover-shadow',
                  gridHover && 'grid-hover-shadow',
                )}
              >
                {this.renderBody()}
              </div>
            </div>
            {this.props.hasPagination && (
              <TablePagination
                {...this.props.pagination}
                hasRows={this.hasRows()}
                showPageSizeSelector={this.props.showPageSizeSelector}
                updatePageSize={this.props.updatePageSize}
                gotoPage={this.props.gotoPage}
              />
            )}
            {this.props.footer}
          </Card.Body>
        </Card>
      </FilterContextProvider>
    );
  }

  renderBody() {
    if (this.props.loading && !this.hasRows()) {
      return (
        <h1 className="text-center">
          <TableLoadingSpinnerContainer {...this.props} />
        </h1>
      );
    }

    if (this.props.error) {
      return <ErrorView error={this.props.error} />;
    }

    if (!this.props.loading && !this.hasRows()) {
      if (this.props.placeholderComponent) {
        return this.props.placeholderComponent;
      } else {
        const { query, verboseName, setQuery } = this.props;
        return (
          <TablePlaceholder
            query={query}
            verboseName={verboseName}
            clearSearch={() => setQuery('')}
            fetch={this.props.fetch}
            actions={this.props.placeholderActions}
          />
        );
      }
    }

    return this.props.mode === 'grid' && this.props.gridItem ? (
      <ErrorBoundary fallback={ErrorMessage}>
        <GridBody
          rows={this.props.rows}
          gridItem={this.props.gridItem}
          gridSize={this.props.gridSize}
        />
      </ErrorBoundary>
    ) : (
      <ErrorBoundary fallback={ErrorMessage}>
        <TableComponent
          {...this.props}
          toggleFilterMenu={this.toggleFilterMenu}
        />
      </ErrorBoundary>
    );
  }

  componentDidMount() {
    if (this.props.initialMode) {
      this.props.setDisplayMode(this.props.initialMode);
    }
    const doFetch = !this.props.initialPageSize && !this.props.initialSorting;
    if (this.props.initialPageSize) {
      this.props.updatePageSize(this.props.initialPageSize);
    }
    if (this.props.initialSorting) {
      this.props.sortList(this.props.initialSorting);
    }
    if (
      this.props.loading ||
      this.props.rows.length ||
      this.props.error ||
      !this.props.firstFetch
    ) {
      return;
    }
    doFetch && this.props.fetch();
  }

  componentDidUpdate(prevProps: TableProps) {
    if (
      prevProps.pagination.currentPage !== this.props.pagination.currentPage
    ) {
      this.props.fetch();
    } else if (
      prevProps.pagination.pageSize !== this.props.pagination.pageSize
    ) {
      if (
        this.props.pagination.pageSize * this.props.pagination.currentPage >=
        this.props.pagination.resultCount
      ) {
        this.props.resetPagination();
      }
      this.props.fetch();
    } else if (prevProps.query !== this.props.query) {
      this.props.resetPagination();
      this.props.fetch();
    } else if (!isEqual(prevProps.filtersStorage, this.props.filtersStorage)) {
      this.props.resetPagination();
    } else if (
      prevProps.sorting !== this.props.sorting &&
      this.props.sorting.loading
    ) {
      this.props.fetch();
    }
  }

  componentWillUnmount() {
    this.props.resetSelection();
  }

  toggleFilterMenu(show: boolean = null) {
    this.setState({
      showFilterMenuToggle: show ?? !this.state.showFilterMenuToggle,
    });
  }

  hasRows() {
    return this.props.rows && this.props.rows.length > 0;
  }

  showActionsColumn() {
    return (
      (this.props.enableMultiSelect && this.props.multiSelectActions) ||
      this.props.tableActions ||
      this.props.dropdownActions?.length ||
      this.props.enableExport ||
      this.props.filters ||
      this.props.hasOptionalColumns ||
      Boolean(this.props.gridItem && this.props.columns.length)
    );
  }
}

function Table<RowType = any>(props: TableProps<RowType>) {
  const {
    fetch,
    filterPosition: originalFilterPosition,
    setFilterPosition,
    applyFilters,
    applyFiltersFn,
    filters,
    renderFiltersDrawer,
    hasOptionalColumns,
    columns,
    toggleColumn,
    activeColumns,
    rowActions,
    initColumnPositions,
  } = props;

  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const filterPosition =
    isSm && originalFilterPosition === 'menu'
      ? 'sidebar'
      : originalFilterPosition;

  useEffect(() => {
    setFilterPosition(originalFilterPosition);
  }, []);

  useEffect(() => {
    // We need to render the filters at the beginning to read the initial filters
    if (filterPosition === 'sidebar') {
      renderFiltersDrawer(filters);
    } else if (filterPosition === 'menu') {
      applyFiltersFn(true);
    }
  }, []);

  useEffect(() => {
    if (filterPosition === 'header' || applyFilters) {
      fetch();
    }
  }, [fetch, filterPosition, applyFilters]);

  useEffect(() => {
    if (columns?.length && hasOptionalColumns) {
      columns.forEach((column) => {
        toggleColumn(column.id, column, column.optional ? false : true);
      });
      // Add actions column to the optional columns
      if (rowActions) {
        toggleColumn(OPTIONAL_COLUMN_ACTIONS_KEY, { keys: [] }, true);
      }
    }
  }, []);

  // Refetch the table if a column is added (Compare with the previous keys that were fetched)
  const prevActiveCols = useRef<string[]>([]);
  useEffect(() => {
    const currentKeys = Object.entries(activeColumns)
      .filter(([, v]) => Boolean(v))
      .map(([key]) => key);
    const isSubset = currentKeys.every((k) =>
      prevActiveCols.current.includes(k),
    );

    if (!isSubset) {
      fetch();
      prevActiveCols.current = currentKeys;
    }
  }, [activeColumns, prevActiveCols]);

  useEffect(() => {
    if (columns?.length) {
      initColumnPositions(columns.map((column) => column.id));
    }
  }, []);

  return <TableClass {...props} filterPosition={filterPosition} />;
}

export default function TableLoader<RowType = any>(props: TableProps<RowType>) {
  const loading = useTableLoader();
  if (loading) {
    return <LoadingSpinner />;
  }
  return <Table {...props} />;
}
