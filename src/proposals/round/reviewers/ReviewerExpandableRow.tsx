import React, { useMemo } from 'react';
import { ProposalReview, RoundReviewer } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { RateStars } from '@waldur/proposals/proposal/create-review/RateStars';
import { ReviewStateRenderer } from '@waldur/proposals/review/ReviewStateRenderer';
import { router } from '@waldur/router';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ProposalReviewsRowActions } from '../proposals/ProposalReviewsRowActions';

interface ReviewerExpandableRowProps {
  row: RoundReviewer & { reviewer_uuid?: string; reviews?: ProposalReview[] };
}

const renderReviewScoreField = ({ row }) => {
  // Only show stars for submitted reviews
  if (row.state !== 'submitted') {
    return null;
  }
  return <RateStars value={row.summary_score} />;
};

export const ReviewerExpandableRow: React.FC<ReviewerExpandableRowProps> = ({
  row,
}) => {
  // If we have pre-fetched reviews, use them directly
  const reviews = useMemo(() => row.reviews || [], [row.reviews]);

  // Create a simple data provider that returns the pre-fetched reviews
  const fetchData = useMemo(() => {
    return async () => {
      return {
        rows: reviews,
        resultCount: reviews.length,
        nextPage: null,
      };
    };
  }, [reviews]);

  const tableProps = useTable({
    table: 'ReviewerReviewsList' + (row.reviewer_uuid || row.email),
    fetchData,
  });

  const columns = [
    {
      title: translate('Proposal'),
      render: ({ row }) => (
        <a
          onClick={() =>
            router.stateService.go('proposal-review', {
              uuid: row.call_managing_organisation_uuid,
              review_uuid: row.uuid,
            })
          }
        >
          {row.proposal_name}
        </a>
      ),
    },
    {
      title: translate('Proposal ID'),
      render: ({ row }) => (
        <span className="fw-semibold">{row.proposal_slug}</span>
      ),
      className: 'text-nowrap',
    },
    {
      title: translate('Status'),
      render: ReviewStateRenderer,
    },
    {
      title: translate('Score'),
      render: renderReviewScoreField,
    },
    {
      title: translate('Comment'),
      render: ({ row }) => {
        const comment = row.summary_private_comment || row.summary_public_comment;
        if (!comment) {
          return <span className="text-muted">-</span>;
        }
        // Show tooltip for long comments (> 80 characters)
        if (comment.length > 80) {
          return (
            <Tip label={comment} id={`comment-${row.uuid}`}>
              <span
                className="ellipsis d-inline-block text-muted"
                style={{ maxWidth: 300 }}
              >
                {comment}
              </span>
            </Tip>
          );
        }
        return <span className="text-muted">{comment}</span>;
      },
    },
  ];

  return (
    <ExpandableContainer>
      <Table
        {...tableProps}
        columns={columns}
        minHeight="auto"
        hideRefresh
        verboseName={translate('Reviews')}
        equalColWidth
        hasActionBar={false}
        rowActions={ProposalReviewsRowActions}
        showPageSizeSelector
        initialPageSize={5}
      />
    </ExpandableContainer>
  );
};
