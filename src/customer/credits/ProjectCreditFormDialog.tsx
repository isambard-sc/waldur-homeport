import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { useSelector, connect } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
import { customerCreditsList } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { lessThanOrEqual, required } from '@waldur/core/validators';
import {
  FieldError,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useProjectCostChart } from '@waldur/project/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { OrganizationProjectSelectField } from '../team/OrganizationProjectSelectField';

import { useMinimalConsumptionFields } from './constants';
import { ProjectCreditFormData } from './types';

interface ProjectCreditFormDialogProps {
  formId: string;
  submitFn(formData: ProjectCreditFormData): void;
  initialValues?: any;
}

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
    } = useQuery(
      ['organizationCredits', customer?.uuid],
      () =>
        customerCreditsList({
          query: { customer_uuid: customer?.uuid },
        }).then((r) => r.data[0]),
      { staleTime: 60 * 1000 },
    );

    const isEdit = Boolean(props.initialValues);

    const valueFieldDescriptionData = {
      currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      credits: isLoading ? (
        <LoadingSpinnerIcon />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        (organizationCredit?.value ?? 0)
      ),
    };

    const project = useSelector((state) =>
      formValueSelector(props.formId)(state, 'project'),
    );

    const {
      options: chartOptions,
      isLoading: isLoadingChart,
      error: errorChart,
      refetch: refetchChart,
    } = useProjectCostChart(project);

    const exceeds = useMemo(
      () => lessThanOrEqual(Number(organizationCredit?.value ?? 0)),
      [organizationCredit],
    );

    const CONSUMPTION_FIELDS = useMinimalConsumptionFields(
      props.formId,
      props.initialValues,
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
            <OrganizationProjectSelectField disabled={isEdit} />
            <NumberField
              label={translate('Allocate credit ({currency})', {
                currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
              })}
              name="value"
              placeholder="0"
              description={
                isEdit
                  ? translate(
                      'Previously saved credit value for this organization: {currency} {credits}',
                      valueFieldDescriptionData,
                      formatJsxTemplate,
                    )
                  : translate(
                      'Credits available for this organization: {currency} {credits}',
                      valueFieldDescriptionData,
                      formatJsxTemplate,
                    )
              }
              unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
              validate={[required, exceeds]}
              required
            />
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
