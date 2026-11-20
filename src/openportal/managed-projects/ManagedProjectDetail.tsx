import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { openportalManagedProjectsRetrieveGet } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';
import { useTitle } from '@/navigation/title';
import { Field } from '@/resource/summary/Field';
import { renderFieldOrDash } from '@/table/utils';

import {
  allowedDomainsLabel,
  AwardLink,
  memberRoleLabel,
  offeringName,
} from './awardDisplay';
import { ManagedProjectActions } from './ManagedProjectActions';
import { ManagedProjectAuditLog } from './ManagedProjectAuditLog';
import { ManagedProjectNotes } from './ManagedProjectNotes';
import { embargoedUntil } from './utils';

const membershipControlLabels: Record<string, string> = {
  open: translate('Open'),
  members_only: translate('Members only'),
  roles_only: translate('Roles only'),
  locked: translate('Locked'),
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Card className="h-100">
    <Card.Header>
      <Card.Title className="mb-0">{title}</Card.Title>
    </Card.Header>
    <Card.Body>{children}</Card.Body>
  </Card>
);

const formatOptionalDate = (value?: string | null) =>
  value ? formatDate(value) : undefined;

export const ManagedProjectDetail = () => {
  const {
    params: { identifier, destination },
  } = useCurrentStateAndParams();
  const router = useRouter();

  const {
    data: row,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['ManagedProjectDetail', identifier, destination],
    queryFn: () =>
      openportalManagedProjectsRetrieveGet({
        path: { identifier, destination },
      }).then((r) => r.data),
    // The awarding portal changes an award, and reviewers add notes, while
    // this page is open: keep it current without a manual reload.
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  useTitle(row?.details?.name || translate('Managed project'), '', 'browser');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !row) {
    return <LoadingErred loadData={refetch} />;
  }

  const details = row.details;
  const embargo = embargoedUntil(row);
  const breakdown =
    details?.breakdown && Object.keys(details.breakdown).length > 0
      ? details.breakdown
      : null;
  const members = details?.members ? Object.entries(details.members) : [];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-5">
        <div>
          <Link state="marketplace-provider-managed-projects">
            {translate('Managed Projects')}
          </Link>
          <h3 className="mb-0 mt-1">
            {details?.name || row.identifier || translate('Unnamed project')}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
            <Badge variant="neutral" shape="pill">
              {row.state}
            </Badge>
            {embargo && (
              <Badge variant="warning" shape="pill" tone="outline">
                {translate('Embargoed until {date}', {
                  date: formatDateTime(embargo),
                })}
              </Badge>
            )}
            {offeringName(row.destination) && (
              <span className="text-muted">
                {offeringName(row.destination)}
              </span>
            )}
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <RefreshButton refetch={refetch} isLoading={isFetching} />
          <ManagedProjectActions
            project={row}
            refetch={refetch}
            onDeleted={() =>
              router.stateService.go('marketplace-provider-managed-projects')
            }
          />
        </div>
      </div>

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <Section title={translate('Project')}>
            <Field
              label={translate('Name')}
              value={renderFieldOrDash(details?.name)}
            />
            <Field
              label={translate('Waldur project')}
              value={
                row.project_data ? (
                  <Link
                    state="project.dashboard"
                    params={{ uuid: row.project_data.uuid }}
                  >
                    {row.project_data.name}
                  </Link>
                ) : (
                  translate('Not attached to a local project')
                )
              }
            />
            <Field
              label={translate('Offering')}
              value={renderFieldOrDash(offeringName(row.destination))}
            />
            <Field
              label={translate('Project template')}
              value={renderFieldOrDash(
                row.project_template_data?.name || details?.template,
              )}
            />
            <Field
              label={translate('Description')}
              value={renderFieldOrDash(details?.description)}
            />
          </Section>
        </Col>

        <Col lg={6}>
          <Section title={translate('Allocation')}>
            <Field
              label={translate('Allocation')}
              value={renderFieldOrDash(details?.allocation)}
            />
            {breakdown &&
              Object.entries(breakdown).map(([component, amount]) => (
                <Field key={component} label={component} value={amount} />
              ))}
          </Section>
        </Col>

        <Col lg={6}>
          <Section title={translate('Dates')}>
            <Field
              label={translate('Created')}
              value={row.created ? formatDateTime(row.created) : undefined}
            />
            <Field
              label={translate('Start date')}
              value={formatOptionalDate(details?.start_date)}
            />
            <Field
              label={translate('End date')}
              value={formatOptionalDate(details?.end_date)}
            />
            <Field
              label={translate('Earliest approve')}
              value={
                details?.earliest_approve
                  ? formatDateTime(details.earliest_approve)
                  : undefined
              }
            />
          </Section>
        </Col>

        <Col lg={6}>
          <Section title={translate('Review')}>
            <Field label={translate('State')} value={row.state} />
            <Field
              label={translate('Remote identifier')}
              value={renderFieldOrDash(row.identifier)}
            />
            <Field
              label={translate('Local identifier')}
              value={renderFieldOrDash(row.local_identifier)}
            />
            <Field
              label={translate('Reviewed by')}
              value={renderFieldOrDash(row.reviewed_by_full_name)}
            />
            <Field
              label={translate('Review comment')}
              value={renderFieldOrDash(row.review_comment)}
            />
          </Section>
        </Col>

        <Col xs={12}>
          <Section title={translate('Members')}>
            {members.length > 0 ? (
              members.map(([email, role]) => (
                <Field
                  key={email}
                  label={email}
                  value={memberRoleLabel(role, row.project_template_data)}
                />
              ))
            ) : (
              <span className="text-muted">
                {translate('No members assigned.')}
              </span>
            )}
          </Section>
        </Col>

        <Col lg={6}>
          <Section title={translate('Links')}>
            <Field
              label={translate('Award')}
              value={<AwardLink link={details?.award} />}
            />
            <Field
              label={translate('Funding call')}
              value={<AwardLink link={details?.call} />}
            />
            <Field
              label={translate('Project page')}
              value={<AwardLink link={details?.project_link} />}
            />
            <Field
              label={translate('Renewal')}
              value={<AwardLink link={details?.renewal} />}
            />
          </Section>
        </Col>

        <Col lg={6}>
          <Section title={translate('Access control')}>
            <Field
              label={translate('Membership control')}
              value={
                details?.membership_control
                  ? membershipControlLabels[details.membership_control] ||
                    details.membership_control
                  : membershipControlLabels.open
              }
            />
            <Field
              label={translate('Allowed domains')}
              value={allowedDomainsLabel(details?.allowed_domains)}
            />
          </Section>
        </Col>

        <Col xs={12}>
          <Section title={translate('Notes')}>
            <ManagedProjectNotes project={row} refetch={refetch} />
          </Section>
        </Col>
      </Row>

      <ManagedProjectAuditLog
        identifier={row.identifier}
        destination={row.destination}
        hideTitle
      />
    </>
  );
};
