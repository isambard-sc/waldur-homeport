import { Validator } from 'redux-form';

import { CustomRadioButton } from '@waldur/core/CustomRadioButton';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';

interface AttrConfig {
  type?: string;
  min?: number;
  parse?: any;
  format?: any;
  component?: any;
  normalize?: (v: string) => string;
  validate?: Validator;
  checked?: boolean;
  rows?: number;
  className?: string;
}

function validateInt(value) {
  return value < 0 ? translate('Value should be positive integer') : undefined;
}

export const configAttrField = (attribute) => {
  let attr: AttrConfig = {};
  switch (attribute.type) {
    case 'integer':
      attr = {
        type: 'number',
        min: 0,
        parse: parseIntField,
        format: formatIntField,
        validate: validateInt,
      };
      break;
    case 'text':
      attr = {
        component: 'textarea',
        className: 'form-control form-control-solid',
        rows: 7,
      };
      break;
    case 'list':
      attr = {
        component: (componentProp) => (
          <Select
            value={componentProp.input.value}
            onChange={(value) => componentProp.input.onChange(value)}
            options={attribute.options}
            getOptionValue={(option) => option.key}
            getOptionLabel={(option) => option.title}
            isMulti={true}
            isClearable={true}
          />
        ),
        normalize: (v) => (v ? v : ''),
      };
      break;
    case 'choice':
      attr = {
        component: (componentProp) => (
          <Select
            value={componentProp.input.value}
            onChange={(value) => componentProp.input.onChange(value)}
            options={attribute.options}
            getOptionValue={(option) => option.key}
            getOptionLabel={(option) => option.title}
            isClearable={true}
          />
        ),
        normalize: (v) => (v ? v : ''),
      };
      break;
    case 'boolean':
      attr = {
        component: (componentProp) => {
          const choices = [
            { value: '', label: translate('All') },
            { value: 'true', label: translate('Yes') },
            { value: 'false', label: translate('No') },
          ];
          return (
            <CustomRadioButton
              choices={choices}
              name={attribute.key}
              input={componentProp.input}
            />
          );
        },
      };
      break;
    default:
      attr = {
        type: 'text',
      };
  }
  return attr;
};
