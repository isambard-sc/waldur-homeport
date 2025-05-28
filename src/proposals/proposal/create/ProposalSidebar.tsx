import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormSyncErrors } from 'redux-form';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarProps } from '@waldur/form/SidebarProps';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { PROPOSAL_UPDATE_SUBMISSION_FORM_ID } from '@waldur/proposals/constants';

interface CompletionPageSidebarProps extends SidebarProps {
  saveAsDraft(): void;
  handleApproveProposal(): void;
  handleRejectProposal(): void;
  canPerformDecisionActions: boolean;
  isSaving?: boolean;
  editable?: boolean;
}

const formErrorsSelector = (state) =>
  getFormSyncErrors(PROPOSAL_UPDATE_SUBMISSION_FORM_ID)(state) as any;

export const ProposalSidebar = (props: CompletionPageSidebarProps) => {
  const errors = useSelector(formErrorsSelector);

  return (
    <>
      <Panel title={translate('Progress')} cardBordered className="mb-5">
        <FormSteps
          steps={props.steps}
          completedSteps={props.completedSteps}
          errors={errors}
          showRequiredErrors
        />
      </Panel>
      {props.editable && (
        <>
          <FloatingSubmitButton
            submitting={props.submitting}
            label={translate('Submit')}
            variant="primary"
            errors={
              Object.keys(errors).length
                ? [
                    translate(
                      'Complete all required sections: {sections} and {lastSection} to proceed.',
                      {
                        sections: [
                          translate('Project details'),
                          translate('Resource requests'),
                        ].join(', '),
                        lastSection: translate('Project team'),
                      },
                    ),
                  ]
                : undefined
            }
          />
          <Button
            variant="secondary"
            onClick={props.saveAsDraft}
            className="w-100 mt-2"
            disabled={props.submitting || props.isSaving}
          >
            {props.isSaving && <LoadingSpinnerIcon className="me-1" />}
            {translate('Save as draft')}
          </Button>
          <TosNotification />
        </>
      )}
      {props.canPerformDecisionActions && (
        <>
          <Button
            variant="btn btn-icon btn-primary"
            onClick={props.handleApproveProposal}
            className="w-100 mt-2"
          >
            <CheckCircle className="me-1" />
            {translate('Accept')}
          </Button>
          <Button
            variant="btn btn-icon btn-light-danger"
            onClick={props.handleRejectProposal}
            className="w-100 mt-2"
          >
            <XCircle className="me-1" />
            {translate('Reject')}
          </Button>
        </>
      )}
    </>
  );
};
