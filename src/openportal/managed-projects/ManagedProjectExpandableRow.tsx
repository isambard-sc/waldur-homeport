import { FC, ReactNode } from 'react';
import { ManagedProject } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n/translate';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import {
  allowedDomainsLabel,
  AwardLink,
  memberRoleLabel,
  offeringName,
} from './awardDisplay';
import { ManagedProjectNotes } from './ManagedProjectNotes';

interface OwnProps {
  row: ManagedProject;
  /** Reloads the list, so a note added here shows up in the thread. */
  refetch(): void | Promise<unknown>;
}

const Line: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <strong>{label}:</strong> {children}
  </div>
);

const ProjectLink: FC<{ row: ManagedProject }> = ({ row }) => {
  if (row.project_data) {
    return (
      <Link
        state="project.dashboard"
        params={{ uuid: row.project_data.uuid }}
        label={row.project_data.name || translate('Unnamed Project')}
      />
    );
  }
  if (row.project) {
    return <>{row.project}</>;
  }
  return <>{translate('No project assigned')}</>;
};

// Untyped: older awards name their template in details.class, which the
// schema's AwardDetails does not describe.
const projectTemplateName = (row: any): string =>
  row.project_template_data?.name ||
  row.project_template ||
  row.details?.template ||
  row.details?.class ||
  translate('No project template assigned');

const MembersList: FC<{ row: ManagedProject }> = ({ row }) => {
  const members = row.details?.members;
  if (!members || Object.keys(members).length === 0) {
    return <>{translate('No members assigned')}</>;
  }
  return (
    <>
      {Object.entries(members).map(([email, role]) => (
        <div key={email} className="ps-4">
          {email}: {memberRoleLabel(role, row.project_template_data)}
        </div>
      ))}
    </>
  );
};

export const ManagedProjectExpandableRow: FC<OwnProps> = ({ row, refetch }) => {
  const details = row.details;
  const breakdown =
    details?.breakdown && Object.keys(details.breakdown).length > 0
      ? details.breakdown
      : null;

  return (
    <ExpandableContainer>
      <div className="overflow-auto">
        <Line label={translate('Project name')}>
          {details?.name || translate('No name assigned.')}
        </Line>
        <Line label={translate('Project')}>
          <ProjectLink row={row} />
        </Line>
        <Line label={translate('Offering')}>
          {renderFieldOrDash(offeringName(row.destination))}
        </Line>
        <Line label={translate('Project template')}>
          {projectTemplateName(row)}
        </Line>
        <Line label={translate('Description')}>
          {details?.description || translate('No description provided.')}
        </Line>
        <Line label={translate('Members')}>
          <MembersList row={row} />
        </Line>
        <Line label={translate('Allocation')}>
          {details?.allocation || translate('No allocation provided.')}
        </Line>
        {breakdown && (
          <Line label={translate('Breakdown')}>
            {Object.entries(breakdown).map(([component, amount]) => (
              <div key={component} className="ps-4">
                {component}: {amount}
              </div>
            ))}
          </Line>
        )}
        <Line label={translate('Start date')}>
          {details?.start_date
            ? formatDate(details.start_date)
            : translate('No start date provided.')}
        </Line>
        <Line label={translate('End date')}>
          {details?.end_date
            ? formatDate(details.end_date)
            : translate('No end date provided.')}
        </Line>
        {details?.earliest_approve && (
          <Line label={translate('Earliest approve')}>
            {formatDateTime(details.earliest_approve)}
          </Line>
        )}
        {details?.membership_control && (
          <Line label={translate('Membership control')}>
            {details.membership_control}
          </Line>
        )}
        <Line label={translate('Allowed domains')}>
          {allowedDomainsLabel(details?.allowed_domains)}
        </Line>
        {details?.award && (
          <Line label={translate('Award')}>
            <AwardLink link={details.award} />
          </Line>
        )}
        {details?.call && (
          <Line label={translate('Call')}>
            <AwardLink link={details.call} />
          </Line>
        )}
        {details?.project_link && (
          <Line label={translate('Project link')}>
            <AwardLink link={details.project_link} />
          </Line>
        )}
        {details?.renewal && (
          <Line label={translate('Renewal')}>
            <AwardLink link={details.renewal} />
          </Line>
        )}
        <Line label={translate('Created')}>
          {row.created
            ? formatDateTime(row.created)
            : translate('No creation date provided.')}
        </Line>
        <Line label={translate('Remote identifier')}>
          {row.identifier || translate('No remote identifier provided.')}
        </Line>
        <Line label={translate('Local identifier')}>
          {row.local_identifier || translate('No local identifier provided.')}
        </Line>
        <Line label={translate('State')}>
          {row.state || translate('No state provided.')}
        </Line>
        <Line label={translate('Reviewed by')}>
          {row.reviewed_by_full_name || translate('No reviewer yet.')}
        </Line>
        <Line label={translate('Comment')}>
          {row.review_comment || translate('No comment provided.')}
        </Line>
        <div className="mt-4">
          <strong>{translate('Notes')}:</strong>
          <div className="mt-2">
            <ManagedProjectNotes
              project={row}
              refetch={refetch}
              maxHeight={240}
            />
          </div>
        </div>
      </div>
    </ExpandableContainer>
  );
};
