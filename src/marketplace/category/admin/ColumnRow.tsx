import { Trash } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field } from 'redux-form';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { FormField } from '@waldur/openstack/openstack-security-groups/rule-editor/FormField';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { deleteCategoryColumn } from './api';

export const ColumnRow = ({ column, fields, index }) => {
  const dispatch = useDispatch();
  const onRemove = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to remove this column: {title}?',
          {
            title: <strong>{column.title}</strong>,
          },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      return;
    }
    try {
      await deleteCategoryColumn(column.uuid);
      fields.remove(index);
      dispatch(showSuccess(translate('Column has been removed successfully.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove column.')));
    }
  };

  return (
    <tr>
      <Field
        name="title"
        component={FormField}
        tooltip={translate('Title is rendered as column header')}
      />
      <Field
        name="attribute"
        component={FormField}
        tooltip={translate('Resource attribute is rendered as table cell')}
      />
      <td>
        <Field
          name="widget"
          component={FormField}
          as="select"
          tooltip={translate(
            'Widget field allows to customise table cell rendering',
          )}
        >
          <option value="">{translate('None')}</option>
          <option value="csv">CSV</option>
          <option value="filesize">{translate('Filesize')}</option>
          <option value="attached_instance">
            {translate('Attached instance')}
          </option>
        </Field>
      </td>
      <Field
        name="index"
        component={FormField}
        tooltip={translate('Index allows to reorder columns')}
      />
      <td>
        <Button variant="danger" onClick={onRemove}>
          <Trash />
        </Button>
      </td>
    </tr>
  );
};
