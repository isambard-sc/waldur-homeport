import { useQuery } from '@tanstack/react-query';
import { Accordion, Form } from 'react-bootstrap';
import { useSelector, connect } from 'react-redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { customerCreditsList } from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import {
  LoadingSpinner,
  LoadingSpinnerIcon,
} from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import {
  FieldError,
  FormContainer,
  SelectField,
  SubmitButton,
} from '@waldur/form';
import { FormGroup } from '@waldur/form/FormGroup';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useProjectCostChart } from '@waldur/project/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { useCustomerProjects } from '../workspace/fetchCustomer';

import {
  useMinimalConsumptionFields,
  useProjectAllocateCreditField,
} from './constants';
import { ProjectCreditFormData } from './types';

interface ProjectCreditFormDialogProps {
  formId: string;
  submitFn(formData: ProjectCreditFormData): void;
  initialValues?: any;
}

// Redux-form compatible project select field
const ProjectSelectFieldComponent = ({ disabled = false }) => {
  const currentCustomer = useSelector(getCustomer);
  const { loading } = useCustomerProjects();

  return (
    <Field
      name="project"
      component={FormGroup as any}
      label={translate('Project')}
      required={true}
      validate={required}
    >
      <SelectField
        options={currentCustomer?.projects}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
        isDisabled={disabled}
        isLoading={loading}
      />
    </Field>
  );
};

export const ProjectCreditFormDialog = connect<
  {},
  {},
  ProjectCreditFormDialogProps
>((_, ownProps: ProjectCreditFormDialogProps) => ({
  form: ownProps.formId,
}))(
  reduxForm<ProjectCreditFormData, ProjectCreditFormDialogProps>({
    destroyOnUnmount: true,
  })((props) => {
    const customer = useSelector(getCustomer);

    const {
      data: organizationCredit,
      isLoading,
      error,
      refetch,
    } = useQuery({
      queryKey: ['organizationCredits', customer?.uuid],

      queryFn: () =>
        customerCreditsList({
          query: { customer_uuid: customer?.uuid },
        }).then((r) => r.data[0]),

      staleTime: 60 * 1000,
    });

    const isEdit = Boolean(props.initialValues);

    const project = useSelector((state) =>
      formValueSelector(props.formId)(state, 'project'),
    );

    const {
      options: chartOptions,
      isLoading: isLoadingChart,
      error: errorChart,
      refetch: refetchChart,
    } = useProjectCostChart(project);

    const CONSUMPTION_FIELDS = useMinimalConsumptionFields(
      props.formId,
      props.initialValues,
    );
    const ALLOCATE_CREDIT_FIELD = useProjectAllocateCreditField(
      organizationCredit?.value,
      isEdit,
    );

    return (
      <form onSubmit={props.handleSubmit(props.submitFn)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit project credit')
              : translate('Add project credit')
          }
          subtitle={translate(
            "Sum of all project credits must not exceed the organization's total available credit.",
          )}
          footer={
            <>
              <CloseDialogButton className="min-w-125px" />
              <SubmitButton
                disabled={props.invalid || !props.dirty || !organizationCredit}
                submitting={props.submitting}
                label={isEdit ? translate('Edit') : translate('Confirm')}
                className="btn btn-primary min-w-125px"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting} className="size-lg">
            <ProjectSelectFieldComponent disabled={isEdit} />
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred loadData={refetch} />
            ) : (
              ALLOCATE_CREDIT_FIELD
            )}
            {CONSUMPTION_FIELDS}
            {isEdit && (
              <Accordion className="mb-7">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <div className="fw-bolder">
                      {translate('Project cost history')}
                      {isLoadingChart && (
                        <LoadingSpinnerIcon className="ms-2" />
                      )}
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {errorChart ? (
                      <LoadingErred loadData={refetchChart} />
                    ) : chartOptions ? (
                      <EChart options={chartOptions} height="150px" />
                    ) : null}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
            <Form.Group>
              <FieldError error={props.error} />
            </Form.Group>
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
