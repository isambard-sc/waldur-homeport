import { useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';

import { exportTableAs } from './actions';
import { ExportConfig, TableState } from './types';

const getFormatOptions = () => [
  { value: 'clipboard', label: translate('Copy to clipboard') },
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];

interface ExportDialogProps {
  resolve: {
    table: string;
    format: ExportConfig['format'];
  };
}

export const ExportDialog = connect<{}, {}, ExportDialogProps>(
  (state: RootState, ownProps) => ({
    initialValues: {
      format: ownProps.resolve?.format,
      withFilters: true,
    },
    tableState: state.tables[ownProps.resolve.table],
  }),
)(
  reduxForm<ExportConfig, ExportDialogProps & { tableState: TableState }>({
    form: 'tableExportForm',
  })((props) => {
    const callback = useCallback(
      (formData: ExportConfig, dispatch: Dispatch<any>) => {
        dispatch(exportTableAs(props.resolve.table, formData));
      },
      [props.resolve.table],
    );
    return (
      <form onSubmit={props.handleSubmit(callback)}>
        <ModalDialog
          title={translate('Export as')}
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting || props.tableState.blocked}
              label={
                !props.tableState.blocked
                  ? translate('Export')
                  : translate('Exporting...')
              }
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <SelectField
              name="format"
              label={translate('Format')}
              simpleValue={true}
              options={getFormatOptions()}
              required={true}
              isClearable={false}
              validate={required}
            />
            <AwesomeCheckboxField
              name="withFilters"
              label={translate('Apply table filters')}
              hideLabel
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
