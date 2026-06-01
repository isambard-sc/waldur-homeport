import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { ProtectedRound } from 'waldur-js-client';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Call } from '@waldur/proposals/types';

const MEMBERSHIP_CONTROL_LABELS: Record<string, string> = {
  open: translate('Open (no restriction)'),
  members_only: translate('Members only'),
  roles_only: translate('Roles only'),
  locked: translate('Locked'),
};

const formatMembershipControl = (value: string | null | undefined): string =>
  MEMBERSHIP_CONTROL_LABELS[value ?? 'open'] ?? value ?? translate('Open (no restriction)');

const formatAllowedDomains = (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0)
    return translate('All domains allowed');
  return (value as string[]).join(', ');
};

import { EditSubmissionInfoButton } from './EditSubmissionInfoButton';

interface RoundSubmissionSectionProps {
  round: ProtectedRound;
  call: Call;
  refetch(): void;
  loading: boolean;
}

export const RoundSubmissionSection: FC<RoundSubmissionSectionProps> = ({
  round,
  call,
  refetch,
  loading,
}) => {
  const duration = useMemo(() => {
    if (!round.start_time || !round.cutoff_time) return null;
    const startDate = parseDate(round.start_time);
    const cutoffDate = parseDate(round.cutoff_time);
    const diff = cutoffDate.diff(startDate, 'days').toObject().days;
    if (diff > 0) {
      return cutoffDate.toRelative({ base: startDate });
    }
    return null;
  }, [round]);

  return (
    <Card id="submission" className="card-bordered">
      <Card.Header>
        <Card.Title>
          {translate('Submission strategy')}
          <RefreshButton refetch={refetch} loading={loading} />
        </Card.Title>
        <div className="card-toolbar">
          <EditSubmissionInfoButton
            round={round}
            call={call}
            refetch={refetch}
          />
        </div>
      </Card.Header>
      <Card.Body>
        <ReadOnlyFormControl
          label={translate('Start date')}
          value={
            round.start_time
              ? formatDateTime(round.start_time)
              : round.start_time
          }
          className="col-12 col-md-6"
        />
        <ReadOnlyFormControl
          label={translate('Cutoff date')}
          value={
            round.cutoff_time
              ? formatDateTime(round.cutoff_time)
              : round.cutoff_time
          }
          className="col-12 col-md-6"
        />
        {translate('Duration')}: {duration || '-'}
        <ReadOnlyFormControl
          label={translate('Minimum required uploads')}
          value={round.minimum_required_uploads ?? 0}
          className="col-12 col-md-6"
        />
        <ReadOnlyFormControl
          label={translate('Default membership control')}
          value={formatMembershipControl(round.default_membership_control)}
          className="col-12 col-md-6"
        />
        <ReadOnlyFormControl
          label={translate('Default allowed domains')}
          value={formatAllowedDomains(round.default_allowed_domains)}
          className="col-12 col-md-6"
        />
      </Card.Body>
    </Card>
  );
};
