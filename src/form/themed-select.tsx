import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import BaseSelect, {
  ClearIndicatorProps,
  components,
  ControlProps,
  MultiValueProps,
  Props as SelectProps,
  ThemeConfig,
} from 'react-select';
import { AsyncPaginate as BaseAsyncPaginate } from 'react-select-async-paginate';
import BaseWindowedSelect from 'react-windowed-select';

import { translate } from '@waldur/i18n';
import CheckboxIcon from '@waldur/table/Checkbox.svg';
import CheckboxEmptyIcon from '@waldur/table/CheckboxEmpty.svg';
import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';
import { useTheme } from '@waldur/theme/useTheme';

const REACT_SELECT_MENU_PORTALING: Partial<SelectProps> = {
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed',
  menuPlacement: 'bottom',
};

const REACT_SELECT_MENU_NO_PORTALING: Partial<SelectProps> = {
  menuPortalTarget: undefined,
  styles: undefined,
  menuPosition: undefined,
  menuPlacement: undefined,
};

export const FilterSelectClearIndicator = (props: ClearIndicatorProps) => {
  const {
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div {...restInnerProps} ref={ref}>
      <div
        style={{ padding: '0px 5px', marginRight: '7px', cursor: 'pointer' }}
      >
        <X size={20} weight="bold" className="text-grey-500" />
      </div>
    </div>
  );
};

export const FilterSelectControl = ({ children, ...props }: ControlProps) => (
  <components.Control {...props}>
    {!(props.hasValue && props.selectProps.components.SingleValue) && (
      <MagnifyingGlass size={20} weight="bold" className="text-grey-500 ms-3" />
    )}
    {children}
  </components.Control>
);

export const MultiSelectOption = (props) => {
  return (
    <components.Option {...props}>
      <span className="svg-icon svg-icon-4 svg-icon-transparent">
        {props.isSelected ? <CheckboxIcon /> : <CheckboxEmptyIcon />}
      </span>
      <label>{props.label}</label>
    </components.Option>
  );
};
const MultiSelectValue = (props: MultiValueProps) => (
  <span className="badge">
    {props.children}
    <RemoveFilterBadgeButton size={12} onClick={props.removeProps.onClick} />
  </span>
);

const MultiSelectLimitedValueContainer = (props) => {
  if (!props.hasValue) {
    return (
      <components.ValueContainer {...props}>
        {props.children}
      </components.ValueContainer>
    );
  }

  const valuesLimit = 2;
  const [values, ...otherChildren] = props.children;
  const hiddenValues = values.slice(valuesLimit);
  const displayValues = values.slice(0, valuesLimit);

  return (
    <components.ValueContainer {...props}>
      {displayValues}

      {hiddenValues.length > 0 && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Popover
              className="metronic-select-tooltip"
              id={uniqueId('tip-multiselect')}
            >
              <Popover.Body>
                {hiddenValues.map((child) => child.props?.children).join(', ')}
              </Popover.Body>
            </Popover>
          }
        >
          <span className="badge">+{hiddenValues.length}</span>
        </OverlayTrigger>
      )}

      {otherChildren}
    </components.ValueContainer>
  );
};

export const REACT_SELECT_TABLE_FILTER: Partial<SelectProps> = {
  className: 'metronic-select-container',
  classNamePrefix: 'metronic-select',
  menuIsOpen: true,
  components: {
    Control: FilterSelectControl,
    ClearIndicator: FilterSelectClearIndicator,
  },
  ...REACT_SELECT_MENU_NO_PORTALING,
};

export const REACT_MULTI_SELECT_TABLE_FILTER: Partial<SelectProps> = {
  ...REACT_SELECT_TABLE_FILTER,
  isMulti: true,
  hideSelectedOptions: false,
  closeMenuOnSelect: false,
  components: {
    ...REACT_SELECT_TABLE_FILTER.components,
    Option: MultiSelectOption,
    MultiValue: MultiSelectValue,
    ValueContainer: MultiSelectLimitedValueContainer,
  },
};

const REACT_MULTI_SELECT: Partial<SelectProps> = {
  className: 'metronic-select-container',
  classNamePrefix: 'metronic-select',
  isMulti: true,
  hideSelectedOptions: false,
  closeMenuOnSelect: false,
  components: {
    Option: MultiSelectOption,
    MultiValue: MultiSelectValue,
    ValueContainer: MultiSelectLimitedValueContainer,
    ClearIndicator: FilterSelectClearIndicator,
  },
  ...REACT_SELECT_MENU_PORTALING,
};

const DARK_COLORS = {
  neutral0: '#1A261D',
  neutral10: '#4C6351',
  neutral20: '#4C6351',
  neutral30: '#4C6351',
  neutral50: '#98b38f',
  neutral80: 'white',
  primary25: '#4C6351',
  primary50: '#4C6351',
};

const useSelectTheme = (): ThemeConfig => {
  const { theme } = useTheme();
  return (boxTheme) => {
    if (theme === 'dark') {
      return {
        ...boxTheme,
        colors: {
          ...boxTheme.colors,
          ...DARK_COLORS,
        },
      };
    }
    return { ...boxTheme };
  };
};

export const Select = ({ components = undefined, ...props }) => {
  const theme = useSelectTheme();
  const composedComponents = props.isMulti
    ? { ...REACT_MULTI_SELECT.components, ...components }
    : components;
  return (
    <BaseSelect
      theme={theme}
      placeholder={translate('Select') + '...'}
      {...(props.isMulti ? REACT_MULTI_SELECT : REACT_SELECT_MENU_PORTALING)}
      components={composedComponents}
      {...props}
    />
  );
};

export const AsyncPaginate: FC<any> = (props) => {
  const theme = useSelectTheme();
  return (
    <BaseAsyncPaginate
      theme={theme}
      additional={{
        page: 1,
      }}
      {...REACT_SELECT_MENU_PORTALING}
      {...props}
    />
  );
};

export const WindowedSelect = (props) => {
  const theme = useSelectTheme();
  return (
    <BaseWindowedSelect
      theme={theme}
      {...REACT_SELECT_MENU_PORTALING}
      {...props}
    />
  );
};
