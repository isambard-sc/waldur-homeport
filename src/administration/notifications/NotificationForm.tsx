import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const renderFields = ({ fields, submitting, meta: { pristine } }) => {
  return (
    <>
      <Tabs defaultActiveKey="tab-0" id="notification-templates-tabs">
        {fields.map((name, index) => {
          const template = fields.value[index];
          return (
            <Tab
              title={<>{template.path}</>}
              eventKey={`tab-${index}`}
              key={`tab-${index}`}
              className="mb-5"
            >
              <Field
                name={`${name}.content`}
                component={TextField as any}
                type="text"
                placeholder={template.original_content}
                validate={required}
              />
              <div className="mt-1 text-end">
                <Button
                  onClick={() =>
                    fields.update(index, {
                      ...fields.value[index],
                      content: template.original_content,
                    })
                  }
                  variant="warning"
                  size="sm"
                >
                  <span className="svg-icon svg-icon-2">
                    <ArrowCounterClockwise />
                  </span>{' '}
                  {translate('Reset')}
                </Button>
              </div>
            </Tab>
          );
        })}
      </Tabs>
      <div className="mb-5 text-end">
        <SubmitButton
          submitting={submitting}
          invalid={pristine}
          label={translate('Save')}
        />
      </div>
    </>
  );
};

export const NotificationForm = ({ submitting }) => {
  return (
    <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7 size-lg">
      <FieldArray
        name="templates"
        component={renderFields}
        props={{ submitting }}
      />
    </Modal.Body>
  );
};
