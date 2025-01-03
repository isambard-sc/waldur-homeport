import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { feedbackOptions } from '@waldur/issues/feedback/utils';

export const EvaluationSelectField = () => (
  <Field
    name="evaluation"
    component={(prop) => (
      <Select
        placeholder={translate('Select evaluation...')}
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={(e) => e.preventDefault()}
        options={feedbackOptions()}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
