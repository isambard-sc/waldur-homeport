import { CaretDown, X } from '@phosphor-icons/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Accordion, Badge, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';

import { TableFilterContext } from './FilterContextProvider';

interface TableFilterItem {
  title: string;
  name?: string;
  badgeValue?(value: any): string | number;
  getValueLabel?(value: any): string | number;
  ellipsis?: boolean;
  showValueBadge?: boolean;
  hideRemoveButton?: boolean;
  onApply?({ title, name, value }): void;
}

const TableHeaderFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  badgeValue = (value) => {
    if (value)
      if (value instanceof Array) {
        return value.length;
      } else {
        return 1;
      }
    else return null;
  },
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const toggleClick = React.useCallback(
    (value, e) => {
      // prevent filter to toggle when clicking on inner clickable elements
      const el = e.target as HTMLElement;
      const isFieldClicked = el.closest('.filter-field');

      if (isFieldClicked) return;
      setOpen(value);
    },
    [setOpen],
  );

  return (
    <button
      type="button"
      className={classNames('filter-toggle btn btn-sm fw-bold bg-hover-light', {
        active: open,
      })}
      onClick={(event) => toggleClick(!open, event)}
    >
      {props.title}
      {open && <div className="filter-field">{props.children}</div>}
      <Field
        name={props.name}
        component={({ input: { value } }) =>
          !['', undefined].includes(value) ? (
            <div
              className="filter-value"
              style={!props.ellipsis ? { maxWidth: 'unset' } : undefined}
            >
              {badgeValue(value) ? (
                <Badge bg="secondary" className="text-dark">
                  {badgeValue(value)}
                </Badge>
              ) : null}
            </div>
          ) : null
        }
      />
      <span className="svg-icon svg-icon-3 rotate-90 ms-2 lh-base">
        <CaretDown size={20} />
      </span>
    </button>
  );
};

export const RemoveFilterBadgeButton = ({ onClick, size = 20 }) => (
  <button
    type="button"
    className="text-btn text-grey-400 text-hover-grey-500 ps-2"
    onClick={onClick}
  >
    <X weight="bold" size={size} />
  </button>
);

export const TableSidebarFilterValues = ({
  value,
  getValueLabel,
  badgeValue = null,
  ellipsis = false,
  remove,
  hideRemoveButton = false,
}) => {
  return !['', undefined].includes(value) ? (
    badgeValue ? (
      badgeValue(value) ? (
        <div
          className="filter-value"
          style={!ellipsis ? { maxWidth: 'unset' } : undefined}
        >
          <Badge
            bg=""
            className="badge-outline-default badge-lg fw-bold fs-7 py-2"
          >
            {badgeValue(value)}
            {!hideRemoveButton && (
              <RemoveFilterBadgeButton
                size={12}
                onClick={() => remove(value, value)}
              />
            )}
          </Badge>
        </div>
      ) : null
    ) : Array.isArray(value) ? (
      <>
        {value.map((v, i) => (
          <Badge
            key={i}
            bg=""
            className="filter-value badge-outline-default badge-lg fw-bold fs-7 px-2"
            style={!ellipsis ? { maxWidth: 'unset' } : undefined}
          >
            {getValueLabel(v)}
            {!hideRemoveButton && (
              <RemoveFilterBadgeButton
                size={12}
                onClick={() => remove(value, v)}
              />
            )}
          </Badge>
        ))}
      </>
    ) : (
      <Badge
        bg=""
        className="filter-value badge-outline-default badge-lg fw-bold fs-7 py-2"
        style={!ellipsis ? { maxWidth: 'unset' } : undefined}
      >
        {getValueLabel(value)}
        {!hideRemoveButton && (
          <RemoveFilterBadgeButton
            size={12}
            onClick={() => remove(value, value)}
          />
        )}
      </Badge>
    )
  ) : null;
};

const TableSidebarFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  getValueLabel = (value) => {
    if (value)
      if (Array.isArray(value)) {
        return value.length;
      } else {
        return value?.label || value;
      }
    else return value;
  },
  ...props
}) => {
  const { setFilter, form } = React.useContext(TableFilterContext);

  const _setFilter = useCallback(
    (value) => {
      setFilter({
        label: props.title,
        name: props.name,
        value: value,
        component: () => (
          <TableSidebarFilterValues
            value={value}
            getValueLabel={getValueLabel}
            badgeValue={props.badgeValue}
            ellipsis={props.ellipsis}
            remove={removeValue}
            hideRemoveButton={props.hideRemoveButton}
          />
        ),
      });
    },
    [props, setFilter],
  );

  const dispatch = useDispatch();
  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      dispatch(change(form, props.name, newValue, true));
      _setFilter(newValue);
    },
    [dispatch, form, props.name, _setFilter],
  );

  const itemValue = useSelector((state) =>
    form ? formValueSelector(form)(state, props.name) : null,
  );
  useEffect(() => {
    _setFilter(itemValue);
    props.onApply &&
      props.onApply({ title: props.title, name: props.name, value: itemValue });
  }, [itemValue, _setFilter]);

  return (
    <Accordion.Item eventKey={props.name}>
      <Accordion.Header className="filter-toggle">
        {props.title}
      </Accordion.Header>
      <Accordion.Body>
        <div
          className={classNames('filter-field', props.showValueBadge && 'mb-2')}
        >
          {props.children}
        </div>
        {props.showValueBadge && (
          <Field
            name={props.name}
            component={({ input: { value } }) => (
              <TableSidebarFilterValues
                value={value}
                getValueLabel={getValueLabel}
                badgeValue={props.badgeValue}
                ellipsis={props.ellipsis}
                remove={removeValue}
                hideRemoveButton={props.hideRemoveButton}
              />
            )}
          />
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

const TableMenuFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  getValueLabel = (value) => {
    if (value)
      if (Array.isArray(value)) {
        return value.length;
      } else {
        return value?.label || value;
      }
    else return value;
  },
  ...props
}) => {
  const {
    setFilter,
    form,
    apply,
    columnFilter,
    selectedSavedFilter,
    registerFilterComponent,
  } = React.useContext(TableFilterContext);

  const _setFilter = useCallback(
    (value) => {
      setFilter({
        label: props.title,
        name: props.name,
        value: value,
        component: () => (
          <TableSidebarFilterValues
            value={value}
            getValueLabel={getValueLabel}
            badgeValue={props.badgeValue}
            ellipsis={props.ellipsis}
            remove={removeValue}
            hideRemoveButton={props.hideRemoveButton}
          />
        ),
      });
    },
    [props, setFilter],
  );

  // Register the filter renderer to access it from outside (from table cells)
  useEffect(() => {
    registerFilterComponent({
      name: props.name,
      setFilter: _setFilter,
    });
  }, [props.name, _setFilter]);

  const dispatch = useDispatch();
  const removeValue = useCallback(
    (prevValue, value) => {
      let newValue;
      if (Array.isArray(prevValue) && prevValue.length > 1) {
        newValue = prevValue.filter((v) => !isEqual(v, value));
      } else {
        newValue = null;
      }
      apply(false);
      dispatch(change(form, props.name, newValue, true));
      _setFilter(newValue);
      apply(true);
    },
    [dispatch, form, props.name, _setFilter],
  );

  const itemValue = useSelector((state) =>
    form ? formValueSelector(form)(state, props.name) : null,
  );

  // The filter field must have an initial value (at least null) so that the filter menu popup does not close when setting this filter for the first time.
  useEffect(() => {
    if (itemValue) {
      _setFilter(itemValue);
    } else {
      dispatch(change(form, props.name, null));
    }
  }, []);

  // Update filter when selecting a saved filter
  useEffect(() => {
    if (!selectedSavedFilter?.values) return;
    const value = selectedSavedFilter.values[props.name];
    if (value) {
      _setFilter(value);
    } else {
      removeValue(value, value);
    }
  }, [selectedSavedFilter]);

  const onApply = () => {
    _setFilter(itemValue);
    props.onApply &&
      props.onApply({ title: props.title, name: props.name, value: itemValue });
    apply();
  };

  const [shown, setShown] = useState(false);
  const menuEl = useRef<HTMLDivElement>(null);

  let isShown = false;
  if (menuEl?.current) {
    isShown = menuEl.current.classList.contains('show');
  }
  useEffect(() => {
    setShown(isShown);
  }, [isShown]);

  const handleClickOutside = useCallback(
    (e) => {
      if (!menuEl?.current || !menuEl?.current.contains(e.target)) {
        setShown(false);
      }
    },
    [menuEl?.current, setShown],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      id={`filter-item-${props.name}`}
      className="menu-item"
      data-kt-menu-trigger="click"
      data-kt-menu-placement={columnFilter ? 'bottom' : 'right-start'}
    >
      <span className="menu-link" aria-hidden="true">
        {props.title}
      </span>

      <div ref={menuEl} className="menu-sub menu-sub-dropdown w-375px py-3">
        <div className="menu-item">
          <div
            className="menu-content filter-field"
            onClick={(e) => e.stopPropagation()}
            aria-hidden="true"
          >
            {shown && props.children}
          </div>
        </div>
        <div className="separator" />
        <div className="menu-item">
          {shown && (
            <div className="menu-content filter-footer pb-0">
              <div className="d-flex gap-4">
                <Button
                  variant="outline"
                  className="btn-outline-default flex-grow-1 w-50"
                  onClick={() => MenuComponent.hideDropdowns(null)}
                >
                  {translate('Cancel')}
                </Button>
                <Button className="flex-grow-1 w-50" onClick={onApply}>
                  {translate('Apply')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Please put only one child in each table filter item. */
export const TableFilterItem: FC<PropsWithChildren<TableFilterItem>> = ({
  ellipsis = true,
  ...props
}) => {
  const { filterPosition } = React.useContext(TableFilterContext);
  if (filterPosition === 'menu') {
    return <TableMenuFilterItem ellipsis={ellipsis} {...props} />;
  } else if (filterPosition === 'sidebar') {
    return <TableSidebarFilterItem ellipsis={ellipsis} {...props} />;
  }
  return <TableHeaderFilterItem ellipsis={ellipsis} {...props} />;
};
