import React, { useMemo } from 'react';
import {
  Proposal,
  ProposalReview,
  proposalReviewsList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { RateStars } from '@waldur/proposals/proposal/create-review/RateStars';
import { ReviewStateRenderer } from '@waldur/proposals/review/ReviewStateRenderer';
import { Field } from '@waldur/resource/summary';
import { router } from '@waldur/router';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ProposalReviewsRowActions } from './ProposalReviewsRowActions';

interface ProposalExpandableRowProps {
  row: Proposal;
}

/** Add a review name for each review (Review 1, Review 2, ...) */
const dataParser = (data: ProposalReview[], query) => {
  const { page = 1, page_size = 5 } = query;
  return data.map((review, index) => {
    const num = (page - 1) * page_size + index + 1;
    Object.assign(review, {
      name: translate('Review, {index}', { index: num }),
    });
    return review;
  });
};

const renderReviewScoreField = ({ row }) => {
  // Only show stars for in_review and submitted reviews
  if (row.state === 'rejected' || row.state === 'created') {
    return null;
  }
  return <RateStars value={row.summary_score} />;
};

export const ProposalExpandableRow: React.FC<ProposalExpandableRowProps> = ({
  row,
}) => {
  const filter = useMemo(() => ({ proposal_uuid: row.uuid }), [row]);
  const tableProps = useTable({
    table: 'ProposalReviewsList' + row.uuid,
    fetchData: createFetcher(proposalReviewsList, { parser: dataParser }),
    filter,
  });

  const columns = [
    {
      title: translate('Review'),
      render: ({ row }) => (
        <a
          onClick={() =>
            router.stateService.go('proposal-review', {
              uuid: row.call_managing_organisation_uuid,
              review_uuid: row.uuid,
            })
          }
        >
          {row.name}
        </a>
      ),
    },
    {
      title: translate('Reviewer'),
      render: ({ row }) => row.reviewer_full_name,
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
        return comment ? (
          <span className="text-muted">{comment}</span>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    },
  ];

  return (
    <ExpandableContainer>
      {row.project_summary && (
        <Field
          label={translate('Project summary')}
          value={row.project_summary}
          className="col-md-12 mb-5"
        />
      )}
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
