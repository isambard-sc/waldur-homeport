import {
  ArrowsClockwise,
  CaretRight,
  FunnelSimple,
  Plus,
  Star,
} from '@phosphor-icons/react';
import { debounce, isEqual, throttle } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues, change } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';
import { openModalDialog } from '@waldur/modal/actions';

import { selectSavedFilter, setSavedFilters } from './actions';
import { COLUMN_FILTER_TOGGLE_CLASS } from './constants';
import { SavedFilterSelect } from './SavedFilterSelect';
import {
  selectSelectedSavedFilter,
  selectTableSavedFilters,
} from './selectors';
import { TableFilterContext } from './TableFilterContainer';
import { TableFilterService } from './TableFilterService';
import { TableProps } from './types';
import { getFiltersFormId, getSavedFiltersKey } from './utils';

const SaveFilterDialog = lazyComponent(
  () => import('./SaveFilterDialog'),
  'SaveFilterDialog',
);

const SaveFilterItems = ({ table, formId, apply }) => {
  const dispatch = useDispatch();

  const formValues = useSelector(getFormValues(formId));
  const selectedSavedFilter = useSelector((state: any) =>
    selectSelectedSavedFilter(state, table),
  );
  const key = useMemo(() => getSavedFiltersKey(table, formId), [table, formId]);

  const list = useSelector((state: any) =>
    selectTableSavedFilters(state, table),
  );

  const saveFilter = useCallback(
    (name, update: boolean) => {
      let newItem;
      Object.entries(formValues).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          delete formValues[key];
        }
      });
      if (update && selectedSavedFilter) {
        // Update
        newItem = {
          ...selectedSavedFilter,
          title: name,
          date: new Date().toISOString(),
          values: formValues,
        };
      } else {
        // New
        const isoDate = new Date().toISOString();
        newItem = {
          id: `${table}-${formId}-${isoDate}`,
          title: name || formatDateTime(null),
          date: isoDate,
          values: formValues,
        };
      }

      TableFilterService.addOrReplace(key, newItem);
      dispatch(setSavedFilters(table, TableFilterService.list(key).reverse()));
      dispatch(selectSavedFilter(table, newItem));
    },
    [key, formValues, selectedSavedFilter, setSavedFilters, selectSavedFilter],
  );

  const onSaveFilter = (e, update = false) => {
    dispatch(
      openModalDialog(SaveFilterDialog, {
        resolve: {
          saveFilter,
        },
        size: 'sm',
        initialValues:
          update && selectedSavedFilter
            ? { name: selectedSavedFilter.title }
            : undefined,
      }),
    );
    e.stopPropagation();
  };

  const hasFiltersApplied = Object.values(formValues || {}).filter(
    (f) => Boolean(f) || f === false,
  ).length;

  return (
    <>
      {(hasFiltersApplied || selectedSavedFilter) && (
        <div
          className="menu-item"
          data-kt-menu-trigger="click"
          data-kt-menu-placement="right-start"
        >
          <span className="menu-link" aria-hidden="true">
            <span className="menu-title">{translate('Current filters')}</span>
            <CaretRight size={18} className="ms-auto" weight="bold" />
          </span>

          <div className="menu-sub menu-sub-dropdown w-250px py-3">
            <span
              className="menu-link"
              aria-hidden="true"
              onClick={onSaveFilter}
            >
              <span className="menu-title">{translate('Save as')}</span>
              <Star size={18} className="ms-auto" weight="bold" />
            </span>
            {selectedSavedFilter ? (
              <span
                className="menu-link"
                aria-hidden="true"
                onClick={(e) => onSaveFilter(e, true)}
              >
                {translate('Update')}
                <ArrowsClockwise size={18} className="ms-auto" weight="bold" />
              </span>
            ) : null}
          </div>
        </div>
      )}
      <div
        className="menu-item"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="right-start"
      >
        <span className="menu-link" aria-hidden="true">
          <span className="menu-title">
            {translate('Saved filters') + ` (${list.length})`}
          </span>
          <CaretRight size={18} className="ms-auto" weight="bold" />
        </span>

        <div className="menu-sub menu-sub-dropdown w-250px py-3">
          <div className="menu-item">
            <div
              className="menu-content filter-field"
              onClick={(e) => e.stopPropagation()}
              aria-hidden="true"
            >
              <SavedFilterSelect
                table={table}
                formId={formId}
                filterPosition="menu"
                onSelect={apply}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const openSubmenu = throttle(
  (menuInstance, item) => menuInstance.show(item),
  100,
  { leading: false },
);

interface TableFiltersMenuProps
  extends Pick<
    TableProps,
    | 'filters'
    | 'filterPosition'
    | 'filtersStorage'
    | 'setFilter'
    | 'applyFiltersFn'
  > {
  table?: TableProps['table'];
  selectedSavedFilter?: TableProps['selectedSavedFilter'];
  openName?: string;
  toggleFilterMenu?(show?): void;
}

export const TableFiltersMenu: FC<TableFiltersMenuProps> = (props) => {
  const filtersFormId = getFiltersFormId(props.filters);

  const menuEl = useRef<HTMLDivElement>(null);
  const menuInstance = useRef(null);

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  // Add show event listener on menu
  useEffect(() => {
    if (menuEl?.current) {
      menuInstance.current = MenuComponent.getInstance(menuEl.current);
      if (menuInstance.current) {
        menuInstance.current.on('kt.menu.dropdown.shown', () => {
          props.applyFiltersFn(false);
          if (props.openName) {
            const item = menuEl.current.querySelector(
              '#filter-item-' + props.openName,
            );
            openSubmenu(menuInstance.current, item);
          }
        });
      }
    }
  }, [menuEl?.current]);

  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(filtersFormId));
  // Add hide event listener on menu (cancel/reset the filter changes if they are not applied yet)
  useEffect(() => {
    if (menuEl?.current) {
      menuInstance.current = MenuComponent.getInstance(menuEl.current);
      if (menuInstance.current) {
        const resetFilters = debounce(() => {
          const keys = props.filtersStorage.map((f) => f.name);
          if (formValues) {
            keys.push(...Object.keys(formValues));
          }
          keys.forEach((name) => {
            const filter = props.filtersStorage.find((fs) => fs.name === name);
            if (!isEqual(formValues?.[name], filter?.value)) {
              dispatch(change(filtersFormId, name, filter?.value || null));
            }
          });
        }, 100);
        menuInstance.current.on('kt.menu.dropdown.hidden', () => {
          // Reset all filters
          // We are using `debounce`, because there may be multiple menu instances, no need to fire the listener for each one.
          resetFilters();
        });
      }
    }
  }, [menuEl?.current, props.filtersStorage, formValues]);

  const apply = (hideMenu = true) => {
    props.applyFiltersFn(true);
    if (hideMenu) {
      // A small delay is needed for the popup listener to be updated with new filters data and then fired
      setTimeout(() => {
        MenuComponent.hideDropdowns(null);
      }, 100);
    }
    props.toggleFilterMenu && props.toggleFilterMenu(true);
  };

  const [existed, setExisted] = useState(true);
  useEffect(() => {
    if (props.openName && menuEl?.current) {
      const item = menuEl.current.querySelector(
        '#filter-item-' + props.openName,
      );
      if (!item) setExisted(false);
    }
  }, [menuEl?.current, props.openName, setExisted]);

  if (!existed) return null;

  return (
    <TableFilterContext.Provider
      value={{
        selectedSavedFilter: props.selectedSavedFilter,
        filterPosition: props.filterPosition,
        form: filtersFormId,
        setFilter: props.setFilter,
        apply,
      }}
    >
      {props.openName ? (
        <>
          <button
            type="button"
            className={COLUMN_FILTER_TOGGLE_CLASS + ' text-btn'}
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom"
            data-kt-menu-flip="bottom"
            data-cy={`${props.openName}-add-filter-button`}
          >
            <FunnelSimple size={16} weight="bold" />
          </button>
          <div
            ref={menuEl}
            className="table-filters-menu column-filter menu menu-sub menu-sub-dropdown menu-column menu-gray-600 menu-state-bg-light menu-state-primary fw-bold fs-6"
            data-kt-menu="true"
            data-cy={`${props.openName}-add-filter-menu`}
          >
            {props.filters}
          </div>
        </>
      ) : (
        <Tip id="table-add-filter-tip" label={translate('Add filter')}>
          <Button
            variant="outline"
            className="btn-outline-default btn-icon btn-add-filter w-40px h-40px"
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom-start"
            data-cy="table-add-filter-button"
          >
            <Plus size={28} />
          </Button>
          <div
            ref={menuEl}
            className="table-filters-menu menu menu-sub menu-sub-dropdown menu-column menu-gray-700 menu-state-bg-light menu-state-primary fw-bold py-1 fs-6 w-250px"
            data-kt-menu="true"
            data-cy="table-add-filter-menu"
          >
            <SaveFilterItems
              table={props.table}
              formId={filtersFormId}
              apply={() => props.applyFiltersFn(true)}
            />
            <div className="separator" />
            {props.filters}
          </div>
        </Tip>
      )}
    </TableFilterContext.Provider>
  );
};
