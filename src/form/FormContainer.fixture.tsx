import { ReactWrapper } from 'enzyme';
import { formValues } from 'redux-form';

import { FormContainer } from './FormContainer';
import { StringField } from './StringField';
import { TextField } from './TextField';

const Component = (options) => (props) => {
  const { submitting, required, onSubmit, description } = options;
  return (
    <form onSubmit={onSubmit && props.handleSubmit(onSubmit)}>
      <FormContainer submitting={submitting}>
        <StringField name="name" label="Project name" required={required} />
        <TextField
          name="description"
          label="Project description"
          required={required}
          description={description}
        />
      </FormContainer>
    </form>
  );
};

export const getNameField = (wrapper: ReactWrapper) =>
  wrapper.find('input').first();
export const getDescriptionField = (wrapper: ReactWrapper) =>
  wrapper.find('textarea').first();
export const getRequiredFields = (wrapper: ReactWrapper) =>
  wrapper.find('label.required');
export const submitForm = (wrapper: ReactWrapper) =>
  wrapper.find('form').simulate('submit');
export const getErrors = (wrapper: ReactWrapper) => wrapper.find('.form-text');
export const getDescriptions = (wrapper: ReactWrapper) =>
  wrapper.find('.text-muted');
export const renderTestForm = (options) => mountTestForm(Component(options));

const OptionalFieldForm = formValues('type')((props) => (
  <FormContainer submitting={false}>
    <StringField name="type" label="Type" />
    {(props as any).type === 'subtask' && (
      <StringField name="parent" label="Parent" />
    )}
  </FormContainer>
));

export const renderOptionalFieldForm = () => mountTestForm(OptionalFieldForm);
