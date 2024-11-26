import {
  CaretDown,
  FunnelSimple,
  SquareLogo,
  WarningCircle,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { FormCheck } from 'react-bootstrap';
import { Field } from 'redux-form';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';

import { TableFilterContext } from './FilterContextProvider';
import { TableProps } from './types';
import { getId } from './utils';

type TableBodyProps = Pick<
  TableProps,
  | 'rows'
  | 'columns'
  | 'rowClass'
  | 'rowKey'
  | 'expandableRow'
  | 'expandableRowClassName'
  | 'rowActions'
  | 'enableMultiSelect'
  | 'selectRow'
  | 'selectedRows'
  | 'toggleRow'
  | 'toggled'
  | 'fetch'
  | 'fieldType'
  | 'fieldName'
  | 'validate'
  | 'columnPositions'
  | 'hasOptionalColumns'
>;

interface TableCellsProps {
  row;
  columns: TableProps['columns'];
  columnsMap;
  columnPositions: TableProps['columnPositions'];
  hasOptionalColumns: TableProps['hasOptionalColumns'];
}

const InlineFilterButton = ({ column, row }) => {
  const { filterComponents, apply, changeFormField } =
    React.useContext(TableFilterContext);

  const callback = () => {
    const filterConfig = filterComponents.find(
      (comp) => comp.name === column.filter,
    );
    const value = column.inlineFilter(row);
    filterConfig.setFilter(value);
    changeFormField(column.filter, value);
    apply();
  };

  return (
    <>
      <button
        className="inline-filter text-btn"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom"
      >
        <FunnelSimple weight="bold" size={16} />
      </button>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-gray-700 menu-state-bg-light-primary w-auto min-w-150px py-1 fw-bold"
        data-kt-menu="true"
      >
        <div className="menu-item">
          <span
            className="menu-link px-5"
            aria-hidden="true"
            onClick={callback}
          >
            <span className="menu-icon">
              <span className="svg-icon svg-icon-2">
                <SquareLogo weight="bold" />
              </span>
            </span>
            <span className="menu-title">{translate('Filter by')}</span>
          </span>
        </div>
      </div>
    </>
  );
};

const hasFilterMenu = (key) => {
  const item = document.querySelector(
    '#kt_content_container .table-filters-menu #filter-item-' + key,
  );
  return Boolean(item);
};

const TableCells = ({
  row,
  columns,
  columnsMap,
  columnPositions,
  hasOptionalColumns,
}: TableCellsProps) => (
  <>
    {hasOptionalColumns
      ? columnPositions
          .filter((id) => columnsMap[id])
          .map(
            (id) =>
              (columnsMap[id].visible ?? true) && (
                <td
                  key={id}
                  className={classNames(
                    columnsMap[id].className,
                    columnsMap[id].inlineFilter && 'has-filter',
                  )}
                  onClick={
                    columnsMap[id].disabledClick
                      ? (e) => e.stopPropagation()
                      : undefined
                  }
                >
                  {(() => {
                    const renderedContent = React.createElement(
                      columnsMap[id].render,
                      { row },
                    );
                    const valueToCopy = columnsMap[id].copyField
                      ? columnsMap[id].copyField(row)
                      : '';
                    if (columnsMap[id].copyField) {
                      return (
                        <div className="d-flex align-items-center gap-1">
                          {renderedContent}
                          <CopyToClipboardButton value={valueToCopy} />
                        </div>
                      );
                    }
                    return renderedContent;
                  })()}
                  {columnsMap[id].inlineFilter &&
                    hasFilterMenu(columnsMap[id].filter) && (
                      <InlineFilterButton column={columnsMap[id]} row={row} />
                    )}
                </td>
              ),
          )
      : columns.map(
          (column, colIndex) =>
            (column.visible ?? true) && (
              <td
                key={colIndex}
                className={classNames(
                  column.className,
                  column.inlineFilter && 'has-filter',
                )}
                onClick={
                  column.disabledClick ? (e) => e.stopPropagation() : undefined
                }
              >
                {(() => {
                  const renderedContent = React.createElement(column.render, {
                    row,
                  });
                  const valueToCopy = column.copyField
                    ? column.copyField(row)
                    : '';
                  if (column.copyField) {
                    return (
                      <div className="d-flex align-items-center gap-1">
                        {renderedContent}
                        <CopyToClipboardButton value={valueToCopy} />
                      </div>
                    );
                  }
                  return renderedContent;
                })()}
                {column.inlineFilter && hasFilterMenu(column.filter) && (
                  <InlineFilterButton column={column} row={row} />
                )}
              </td>
            ),
        )}
  </>
);

export const TableBody: FunctionComponent<TableBodyProps> = ({
  rows,
  columns,
  rowClass,
  rowKey,
  expandableRow,
  expandableRowClassName,
  rowActions,
  enableMultiSelect,
  selectRow,
  selectedRows,
  toggleRow,
  toggled,
  fetch,
  fieldType,
  fieldName,
  validate,
  columnPositions,
  hasOptionalColumns,
}) => {
  const columnsMap = useMemo(
    () =>
      columns.reduce(
        (result, column) => ({ ...result, [column.id]: column }),
        {},
      ),
    [columns],
  );

  const trClick = useCallback(
    (row, index, e) => {
      if (!expandableRow) return;
      // prevent expandable row to toggle when clicking on inner clickable elements
      const el = e.target as HTMLElement;
      if (
        el.onclick ||
        el instanceof HTMLInputElement ||
        el.closest('button, a')
      )
        return;
      toggleRow(getId(row, index));
    },
    [toggleRow],
  );

  const isRowSelected = (row: any) => {
    if (!selectedRows) return false;
    return selectedRows.some((item) => item[rowKey] === row[rowKey]);
  };

  const onChangeField = useCallback(
    (row, input) => {
      if (fieldType === 'checkbox') {
        const newValues: any[] = input.value || [];
        const index = newValues.findIndex((v) => v[rowKey] === row[rowKey]);
        // Is field checked
        if (index > -1) {
          newValues.splice(index, 1);
        } else {
          newValues.push(row);
        }
        input.onChange(newValues);
      } else if (fieldType === 'radio') {
        input.onChange(row);
      }
      input.onBlur();
    },
    [fieldType],
  );

  // Re-initialize menu popups when the rows are changed, so that the cell-filter popups works properly.
  useEffect(() => {
    MenuComponent.reinitialization();
  }, [rows?.length]);

  const TR = (row, rowIndex, fieldProps = null) => {
    let isChecked = false;
    if (fieldProps) {
      if (Array.isArray(fieldProps.input.value)) {
        isChecked = fieldProps.input.value.some(
          (v) => v[rowKey] === row[rowKey],
        );
      } else {
        isChecked = fieldProps.input.value?.[rowKey] === row[rowKey];
      }
    } else {
      isChecked = isRowSelected(row);
    }
    return (
      <tr
        className={
          classNames(
            typeof rowClass === 'function' ? rowClass({ row }) : rowClass,
            {
              expanded: expandableRow && toggled[getId(row, rowIndex)],
              checked: fieldType && isChecked,
            },
          ) || undefined
        }
        onClick={(event) => {
          trClick(row, rowIndex, event);
          if (fieldProps) {
            onChangeField(row, fieldProps.input);
          }
        }}
      >
        {(enableMultiSelect || fieldType) && (
          <td className="row-control">
            <div>
              {fieldType && fieldProps ? (
                <>
                  {isChecked &&
                    fieldProps.meta.touched &&
                    fieldProps.meta.error && (
                      <Tip
                        label={fieldProps.meta.error}
                        id={`tableErrorTip-${rowIndex}`}
                        className="error-mark"
                      >
                        <WarningCircle />
                      </Tip>
                    )}
                  <FormCheck
                    name={fieldProps.input.name}
                    type={fieldType}
                    className="form-check form-check-custom form-check-sm"
                    checked={isChecked}
                    onChange={() => onChangeField(row, fieldProps.input)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              ) : (
                <FormCheck
                  className="form-check form-check-custom form-check-sm"
                  checked={isChecked}
                  onChange={() => selectRow(row)}
                />
              )}
            </div>
          </td>
        )}
        {expandableRow && (
          <td
            data-testid="row-expander"
            className={toggled[getId(row, rowIndex)] ? 'active' : ''}
          >
            <CaretDown size={20} weight="bold" className="rotate-180" />
          </td>
        )}
        <TableCells
          row={row}
          columns={columns}
          columnsMap={columnsMap}
          columnPositions={columnPositions}
          hasOptionalColumns={hasOptionalColumns}
        />
        {rowActions && (
          <td className="row-actions">
            <div>{React.createElement(rowActions, { row, fetch })}</div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {fieldType ? (
            <Field
              name={fieldName}
              component={(fieldProps) => TR(row, rowIndex, fieldProps)}
              validate={validate}
            />
          ) : (
            TR(row, rowIndex)
          )}
          {expandableRow && toggled[getId(row, rowIndex)] && (
            <tr>
              <td
                colSpan={
                  columns.length +
                  1 +
                  (rowActions ? 1 : 0) +
                  (enableMultiSelect || fieldType ? 1 : 0)
                }
                className={expandableRowClassName}
              >
                {React.createElement(expandableRow, { row })}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  );
};
