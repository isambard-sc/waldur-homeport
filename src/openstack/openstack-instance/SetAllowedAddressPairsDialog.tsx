import { Plus, Trash } from '@phosphor-icons/react';
import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, FieldArray, reduxForm } from 'redux-form';

import { post } from '@waldur/core/api';
import { SubmitButton } from '@waldur/form';
import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { validatePrivateCIDR } from '../utils';

import { formatAddressList } from './utils';

interface AllowedAddressPair {
  ip_address: string;
  mac_address: string;
}

interface OwnProps {
  resolve: {
    port: {
      allowed_address_pairs: AllowedAddressPair[];
    };
    instance: {
      url: string;
    };
  };
}

interface FormData {
  pairs: AllowedAddressPair[];
}

const ValidatedInputField = renderValidationWrapper(InputField);

const PairRow = ({ pair, onRemove }) => (
  <tr>
    <td>
      <Field
        name={`${pair}.ip_address`}
        component={ValidatedInputField}
        validate={validatePrivateCIDR}
      />
    </td>
    <td>
      <Field name={`${pair}.mac_address`} component={ValidatedInputField} />
    </td>
    <td>
      <Button variant="default" onClick={onRemove}>
        <span className="svg-icon svg-icon-2">
          <Trash />
        </span>{' '}
        {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const PairAddButton = ({ onClick }) => (
  <Button variant="default" onClick={onClick}>
    <span className="svg-icon svg-icon-2">
      <Plus />
    </span>{' '}
    {translate('Add pair')}
  </Button>
);

const PairsTable: React.FC<any> = ({ fields }) =>
  fields.length > 0 ? (
    <>
      <Table responsive={true} bordered={true} striped={true} className="mt-3">
        <thead>
          <tr>
            <th>{translate('Internal network mask (CIDR)')}</th>
            <th>{translate('MAC address (optional)')}</th>
            <th>{translate('Actions')}</th>
          </tr>
        </thead>

        <tbody>
          {fields.map((pair, index) => (
            <PairRow
              key={pair}
              pair={pair}
              onRemove={() => fields.remove(index)}
            />
          ))}
        </tbody>
      </Table>
      <PairAddButton onClick={() => fields.push({})} />
    </>
  ) : (
    <PairAddButton onClick={() => fields.push({})} />
  );

const enhance = compose(
  connect<{}, {}, OwnProps>((_, ownProps) => ({
    initialValues: { pairs: ownProps.resolve.port.allowed_address_pairs },
  })),
  reduxForm<FormData, OwnProps>({
    form: 'SetAllowedAddressPairsDialog',
  }),
);

export const SetAllowedAddressPairsDialog = enhance(
  ({ resolve, invalid, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const setAllowedAddressPairs = async (formData: FormData) => {
      try {
        await post(
          `/openstack-instances/${resolve.instance.uuid}/update_allowed_address_pairs/`,
          {
            subnet: resolve.port.subnet,
            allowed_address_pairs: formData.pairs || [],
          },
        );
        dispatch(
          showSuccess(translate('Allowed address pairs update was scheduled.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to update allowed address pairs.'),
          ),
        );
      }
    };

    return (
      <form onSubmit={handleSubmit(setAllowedAddressPairs)}>
        <ModalDialog
          title={translate(
            'Set allowed address pairs ({instance} / {ipAddress})',
            {
              instance: resolve.instance.name,
              ipAddress: formatAddressList(resolve.port),
            },
          )}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Update')}
              />
            </>
          }
        >
          <FieldArray name="pairs" component={PairsTable} />
        </ModalDialog>
      </form>
    );
  },
);
