import React, { FunctionComponent } from 'react';
import { FormControl } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FieldError } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import { Namespace } from '../types';

import { DecoratedField } from './DecoratedField';
import { SelectControl } from './SelectControl';

const NamespaceSwitcher: FunctionComponent = () => (
  <Field
    name="useNewNamespace"
    component={(fieldProps) => (
      <button
        className="text-btn text-dark"
        type="button"
        onClick={() => fieldProps.input.onChange(!fieldProps.input.value)}
      >
        {fieldProps.input.value
          ? translate('Use an existing namespace')
          : translate('Add to a new namespace')}
      </button>
    )}
  />
);

interface NamespaceFieldProps {
  options: Namespace[];
}

export const NamespaceField: React.FC<NamespaceFieldProps> = ({ options }) => {
  const useNew = useSelector((state: RootState) =>
    formValueSelector('RancherTemplateQuestions')(state, 'useNewNamespace'),
  );

  const renderControl = React.useCallback(
    (fieldProps) =>
      useNew ? (
        <>
          <FormControl
            {...fieldProps.input}
            placeholder={translate('e.g. MyApp')}
          />
          {fieldProps.meta.touched && (
            <FieldError error={fieldProps.meta.error} />
          )}
        </>
      ) : (
        <SelectControl
          options={options}
          input={fieldProps.input}
          getLabel={({ name }) => name}
          getValue={({ url }) => url}
        />
      ),
    [useNew, options],
  );

  const namespaceNames = React.useMemo(
    () => options.map((option) => option.name),
    [options],
  );

  const validateNamespace = React.useCallback(
    (value: string | Namespace) => {
      if (typeof value === 'string' && namespaceNames.includes(value)) {
        return translate('Namespace should be unique.');
      }
    },
    [namespaceNames],
  );

  return (
    <DecoratedField
      required={true}
      validate={[required, validateNamespace]}
      label={translate('Namespace')}
      variable={useNew ? 'newNamespace' : 'namespace'}
      action={options.length > 0 ? <NamespaceSwitcher /> : null}
      component={renderControl}
    />
  );
};
