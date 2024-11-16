import { FC, ReactNode, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { WizardStepIndicator } from '@waldur/form/WizardStepIndicator';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import './wizard.scss';

export interface WizardFormStepProps
  extends Pick<InjectedFormProps, 'form' | 'initialValues'> {
  title: string;
  onSubmit(formData, dispatch, formProps): Promise<any> | void;
  submitLabel: string;
  submitDisabled?: boolean;
  steps: string[];
  step: number;
  onPrev(): void;
  onStep?(step: number): void;
  validate?(values: any): any;
  data?: any;
  reinitialize(): void;
}

interface WizardFormProps extends WizardFormStepProps, InjectedFormProps {
  formValues: any;
  children: ReactNode | FC<WizardFormProps>;
  submit(): void;
}

const WizardFormPure: FC<WizardFormProps> = (props) => {
  useEffect(() => {
    // Touch the form at the beginning to avoid going to the next step without a validation
    props.reinitialize();
    if (!props.anyTouched) props.touch();
  }, []);

  return (
    <form className="wizard" onSubmit={props.handleSubmit(props.onSubmit)}>
      <Modal.Header closeButton className="without-border">
        <Modal.Title className="h2 fw-bolder">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="wizard-big wizard-body clearfix">
          <WizardStepIndicator
            steps={props.steps}
            activeStep={props.step}
            onSelect={(step) => {
              if (!props.onStep || props.submitDisabled) return;
              if (step > props.step) {
                props.submit();
                if (props.valid) {
                  props.onStep(step);
                }
              } else {
                props.onStep(step);
              }
            }}
          />
          <div className="content clearfix">
            {typeof props.children === 'function'
              ? props.children(props)
              : props.children}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {props.step == 0 ? (
          <CloseDialogButton className="min-w-125px" />
        ) : (
          <Button
            variant="secondary"
            className="min-w-125px"
            onClick={props.onPrev}
          >
            {translate('Previous')}
          </Button>
        )}
        <SubmitButton
          submitting={props.submitting}
          label={props.submitLabel}
          invalid={props.submitDisabled}
          className="min-w-125px"
        />
      </Modal.Footer>
    </form>
  );
};

export const WizardForm = reduxForm<{}, any>({
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  keepDirtyOnReinitialize: true,
})(WizardFormPure);
