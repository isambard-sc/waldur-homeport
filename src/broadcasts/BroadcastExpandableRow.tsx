import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BroadcastMessage } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { getProposalStateOptions } from '@/proposals/utils';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { OptionsList } from './OptionsList';
import { RecipientsField } from './RecipientsField';

export const BroadcastExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <Row>
      <Col sm={8} style={{ whiteSpace: 'pre-line' }}>
        <p>{row.body}</p>
        <p>{ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}</p>
      </Col>
      <Col sm={4}>
        <OptionsList
          label={translate('Organizations')}
          list={row.query['customers']}
        />

        <OptionsList
          label={translate('Offerings')}
          list={row.query['offerings']}
        />

        {row.query.rounds?.length ? (
          <>
            <OptionsList
              label={translate('Proposal rounds')}
              list={row.query.rounds}
            />
            <Field
              label={translate('Round recipients')}
              value={[
                row.query.proposal_teams !== false &&
                  translate('Proposal teams'),
                row.query.reviewers && translate('Reviewers'),
              ]
                .filter(Boolean)
                .join(', ')}
              labelCol={5}
              valueCol={7}
            />
            {row.query.proposal_states?.length ? (
              <Field
                label={translate('Proposal states')}
                value={row.query.proposal_states
                  .map(
                    (state) =>
                      getProposalStateOptions().find(
                        (option) => option.value === state,
                      )?.label ?? state,
                  )
                  .join(', ')}
                labelCol={5}
                valueCol={7}
              />
            ) : null}
          </>
        ) : null}

        <RecipientsField row={row} />

        {row.send_at && (
          <Field
            label={translate('Send at')}
            value={formatDateTime(row.send_at)}
            labelCol={5}
            valueCol={7}
          />
        )}
      </Col>
    </Row>
  </ExpandableContainer>
);
