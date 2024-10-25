import { Plus, Trash } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Button, Form } from 'react-bootstrap';
import { BaseFieldArrayProps, Field, FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const FieldsListGroup = ({ fields }: BaseFieldArrayProps<any>) => {
  const addRow = () => {
    fields.push({});
  };

  const removeRow = (index) => fields._isFieldArray && fields.remove(index);

  return (
    <>
      {fields.length > 0 && (
        <Form.Group id="openstack-external-ip-set">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-50">{translate('Floating IP')}</td>
                  <td>{translate('External IP')}</td>
                  <td className="w-5px" />
                </tr>
              </thead>
              <tbody>
                {fields.map((component, i) => (
                  <Fragment key={component}>
                    <tr>
                      <td>
                        <Field
                          name={`${component}.floating_ip`}
                          required={true}
                          component={FormGroup}
                          validate={[required]}
                          hideLabel
                          spaceless
                        >
                          <StringField />
                        </Field>
                      </td>
                      <td>
                        <Field
                          name={`${component}.external_ip`}
                          required={true}
                          component={FormGroup}
                          validate={[required]}
                          hideLabel
                          spaceless
                        >
                          <StringField />
                        </Field>
                      </td>
                      <td>
                        <Button
                          variant="light-danger"
                          className="btn-icon"
                          onClick={() => removeRow(i)}
                        >
                          <span className="svg-icon svg-icon-2">
                            <Trash />
                          </span>
                        </Button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <div>
        <Button
          variant="outline"
          className="btn-outline-default"
          onClick={addRow}
        >
          <span className="svg-icon svg-icon-2">
            <Plus />
          </span>{' '}
          {translate('Add')}
        </Button>
      </div>
    </>
  );
};

export const OpenStackExternalIpsField = () => (
  <FieldArray
    name="secret_options.ipv4_external_ip_mapping"
    component={FieldsListGroup}
    rerenderOnEveryChange
  />
);
