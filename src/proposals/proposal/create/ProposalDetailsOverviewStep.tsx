import { EyeIcon } from '@phosphor-icons/react';
import { Button, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Link } from '@waldur/core/Link';
import { getUUID } from '@waldur/core/utils';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { EndingField } from '@waldur/proposals/EndingField';
import { Proposal } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';

const ProposalDetailsDialog = lazyComponent(() =>
  import('../ProposalDetailsDialog').then((module) => ({
    default: module.ProposalDetailsDialog,
  })),
);

const DetailsOverviewButton = ({ proposal }) => {
  const dispatch = useDispatch();
  return (
    <Button
      variant="tertiary"
      className="ms-auto"
      onClick={() =>
        dispatch(
          openModalDialog(ProposalDetailsDialog, {
            proposal,
          }),
        )
      }
    >
      <span className="svg-icon svg-icon-2">
        <EyeIcon weight="bold" />
      </span>
      {translate('More details')}
    </Button>
  );
};

export const ProposalDetailsOverviewStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal & {
    modified?: string;
    reviewed?: string;
  } = props.params.proposal;
  return (
    <VStepperFormStepCard
      id={props.id}
      title={translate('Details overview')}
      actions={<DetailsOverviewButton proposal={proposal} />}
    >
      <Row className="fs-6">
        <Col sm={6}>
          <Field
            label={translate('Call name')}
            value={proposal.call_name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Round deadline')}
            value={
              <EndingField endDate={proposal.round.cutoff_time} dateFirst />
            }
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Round reference')}
            value={proposal.round.name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Created by')}
            value={proposal.created_by_name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Created')}
            value={formatDateTime(proposal.created)}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        {proposal.modified && (
          <Col sm={6}>
            <Field
              label={translate('Last edited')}
              value={formatDateTime(proposal.modified)}
              labelCol={5}
              valueCol={7}
            />
          </Col>
        )}
        {proposal.state !== 'draft' && proposal.submitted_at && (
          <Col sm={6}>
            <Field
              label={translate('Submitted')}
              value={formatDateTime(proposal.submitted_at)}
              labelCol={5}
              valueCol={7}
            />
          </Col>
        )}
        {(proposal.state === 'accepted' || proposal.state === 'rejected') &&
          (proposal.reviewed || proposal.modified) && (
            <Col sm={6}>
              <Field
                label={translate(
                  proposal.state === 'accepted' ? 'Accepted' : 'Rejected',
                )}
                value={formatDateTime(proposal.reviewed || proposal.modified)}
                labelCol={5}
                valueCol={7}
              />
            </Col>
          )}
        {proposal.state === 'accepted' && proposal.project && (
          <Col sm={6}>
            <Field
              label={translate('Project')}
              value={
                <Link
                  state="project.dashboard"
                  params={{ uuid: getUUID(proposal.project) }}
                  label={proposal.project_name}
                />
              }
              labelCol={5}
              valueCol={7}
            />
          </Col>
        )}
      </Row>
    </VStepperFormStepCard>
  );
};
