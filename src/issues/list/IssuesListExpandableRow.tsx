import './IssuesListExpandableRow.scss';

import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { linkify } from '@waldur/issues/utils';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const IssuesListExpandableRow: FunctionComponent<{
  row;
  supportOrStaff;
}> = ({ row, supportOrStaff }) => (
  <ExpandableContainer>
    <div className="issue-list-expandable-row col-sm-12">
      <div className="mb-1">
        <dt>{translate('Reporter')}:</dt>
        <dd>{row.reporter_name || 'N/A'}</dd>
      </div>

      <div className="mb-1">
        <dt>{translate('Organization')}:</dt>
        <dd>{row.customer_name || 'N/A'}</dd>
      </div>
      <div className="mb-1">
        <dt>{translate('Project')}:</dt>
        <dd>{row.project_name || 'N/A'}</dd>
      </div>

      <div className="mb-1">
        <dt>{translate('Service type')}:</dt>
        <dd>{row.resource_type || 'N/A'}</dd>
      </div>

      <div className="mb-1">
        <dt>{translate('Created')}:</dt>
        <dd>{formatDate(row.created)}</dd>
      </div>

      {supportOrStaff && (
        <div className="mb-1">
          <dt>{translate('Assigned to')}:</dt>
          <dd>{row.assignee_name || 'N/A'}</dd>
        </div>
      )}
    </div>
    <div>
      <dt>{translate('Description')}:</dt>
      <dd>
        <Tip id="description-tooltip" label={row.description}>
          <span className="d-inline-block">
            {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
              <FormattedJira text={linkify(row.description)} />
            ) : (
              <FormattedHtml html={linkify(row.description)} />
            )}
          </span>
        </Tip>
      </dd>
    </div>
  </ExpandableContainer>
);
