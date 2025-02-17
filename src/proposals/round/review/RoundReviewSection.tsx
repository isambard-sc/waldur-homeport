import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Call, Round } from '@waldur/proposals/types';
import { formatRoundReviewStrategy } from '@waldur/proposals/utils';

import { EditReviewInfoButton } from './EditReviewInfoButton';

interface RoundReviewSectionProps {
  round: Round;
  call: Call;
  refetch(): void;
  loading: boolean;
}

export const RoundReviewSection: FC<RoundReviewSectionProps> = ({
  round,
  call,
  refetch,
  loading,
}) => {
  const latestReviewDate = useMemo(() => {
    if (!round.cutoff_time || !round.review_duration_in_days) return null;
    return formatDateTime(
      parseDate(round.cutoff_time).plus({
        days: round.review_duration_in_days,
      }),
    );
  }, [round]);

  return (
    <Card id="review" className="card-bordered">
      <Card.Header>
        <Card.Title>
          {translate('Review strategy')}
          <RefreshButton refetch={refetch} loading={loading} />
        </Card.Title>
        <div className="card-toolbar">
          <EditReviewInfoButton round={round} call={call} refetch={refetch} />
        </div>
      </Card.Header>
      <Card.Body>
        <ReadOnlyFormControl
          label={translate('Review strategy')}
          value={formatRoundReviewStrategy(round.review_strategy)}
          className="col-12 col-md-6"
        />
        <ReadOnlyFormControl
          label={translate('Review duration')}
          value={round.review_duration_in_days}
          className="col-12 col-md-6"
          addon="days"
        />
        <ReadOnlyFormControl
          label={translate('Minimum reviewers')}
          value={round.minimum_number_of_reviewers}
          className="col-12 col-md-6"
        />
        {translate('Latest review completion date')}: {latestReviewDate}
      </Card.Body>
    </Card>
  );
};
