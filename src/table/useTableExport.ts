import { isEqual } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { isEmpty, orderByFilter } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { fetchAll } from '@waldur/table/api';

import { DASH_ESCAPE_CODE } from './constants';
import exportAs from './exporters';
import { ExportConfig } from './exporters/types';
import { getTableOptions } from './registry';
import { selectTableRows } from './selectors';
import { getTableState } from './store';
import { TableRequest } from './types';

export function useTableExport(table, props?) {
  const {
    exportFields,
    exportKeys,
    exportRow,
    exportData,
    fetchData,
    ...options
  } = getTableOptions(table);

  const tableState = useSelector(getTableState(table));
  let rows = useSelector((state: RootState) => selectTableRows(state, table));
  const customExport = Boolean(exportFields || exportRow);

  async function fetchRows(config) {
    // Calculate array for export data automatically
    let exportColumns = [];
    if (!customExport) {
      // Apply order of columns
      if (
        props.columnPositions &&
        !isEmpty(props.columnPositions.filter(Boolean))
      ) {
        props.columnPositions.forEach((colName) => {
          const column = props.columns.find((col) => col.id === colName);
          if (column) {
            exportColumns.push(column);
          }
        });
      } else {
        exportColumns = props.columns;
      }

      // Apply enabled columns
      if (props.activeColumns && !isEmpty(props.activeColumns)) {
        const activeColumnsKeys = Object.values(props.activeColumns);
        exportColumns = exportColumns.filter((col) =>
          activeColumnsKeys.some((keys) => isEqual(keys, col.keys)),
        );
      }

      // Remove false columns
      exportColumns = exportColumns.filter((col) => col.export !== false);
    }

    if (config.allPages) {
      const request: TableRequest = {
        pageSize: Math.max(tableState.pagination.resultCount, 200),
        currentPage: 1,
        filter: config.withFilters ? { ...options.filter } : {},
      };
      if (config.withFilters && options.queryField && tableState.query) {
        request.filter[options.queryField] = tableState.query;
      }
      if (tableState.sorting && tableState.sorting.field) {
        request.filter.o = orderByFilter(tableState.sorting);
      }

      if (customExport) {
        if (exportKeys && exportKeys.length > 0) {
          request.filter.field = exportKeys;
        }
      } else if (exportColumns.length > 0) {
        const autoExportKeys = [];
        exportColumns.map((col) => {
          if (typeof col.export === 'string') {
            autoExportKeys.push(col.export);
          } else if (col.exportKeys) {
            autoExportKeys.push(col.exportKeys);
          } else if (col.keys) {
            autoExportKeys.push(col.keys);
          }
        });
        if (autoExportKeys.length > 0) {
          request.filter.field = autoExportKeys;
        }
      }

      rows = await fetchAll(fetchData, request);
    }

    let data;
    if (exportFields || exportRow) {
      // Generate custom export data
      const fields =
        typeof exportFields === 'function' ? exportFields(props) : exportFields;

      data = {
        fields,
        data: exportData
          ? exportData(rows, props)
          : rows.map((row) => exportRow(row, props)),
      };
    } else {
      // Generate export data automatically
      const fields = exportColumns.map(
        (col) =>
          col.exportTitle ||
          (typeof col.title === 'string' ? col.title : col.id),
      );

      data = {
        fields,
        data: rows.map((row) =>
          exportColumns.map((col) => {
            if (col.export && typeof col.export === 'function') {
              return col.export(row);
            }
            const value =
              row[col.export] ||
              row[col.keys ? col.keys[0] : null] ||
              row[col.orderField] ||
              row[col.id];

            if (
              typeof value === 'string' ||
              [null, undefined].includes(value)
            ) {
              return value || DASH_ESCAPE_CODE;
            } else {
              return value;
            }
          }),
        ),
      };
    }
    return data;
  }

  const dispatch = useDispatch();
  return async (config: ExportConfig) => {
    try {
      const data = await fetchRows(config);
      await exportAs(config.format, table, data);
      dispatch(
        showSuccess(
          translate('Table has been exported to {format}.', {
            format: config.format,
          }),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to export table.')));
    }
  };
}
