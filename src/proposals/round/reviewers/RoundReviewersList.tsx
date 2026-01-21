import { FC, useMemo } from 'react';
import {
  callRoundsReviewersList,
  proposalReviewsList,
  ProtectedRound,
  RoundReviewer,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ImportAssignmentsButton } from './ImportAssignmentsButton';
import { ReviewerExpandableRow } from './ReviewerExpandableRow';
import { ReviewsExportButton } from './ReviewsExportButton';

interface RoundReviewersListProps {
  round: ProtectedRound;
  call: Call;
}

// Enhanced RoundReviewer with computed statistics
interface EnhancedRoundReviewer extends RoundReviewer {
  reviewer_uuid?: string;
  outstanding_reviews?: number;
  declined_reviews?: number;
  in_progress_reviews?: number;
  submitted_reviews?: number;
  average_score?: number;
  acceptance_rate?: number;
  reviews?: any[]; // Pre-fetched reviews for this reviewer
}

// Custom fetcher that enhances reviewer data with review statistics
const createEnhancedReviewersFetcher = (roundUuid: string, callUuid?: string) => {
  return async (request) => {
    const { queryClient } = await import('@waldur/Application');
    const { fetchResultCount, parseNextPage } = await import('@waldur/core/api');
    const { getTableState } = await import('@waldur/table/selectors');
    const storeModule = await import('@waldur/store/store');
    const store = storeModule.default;

    // Get the current sorting state from Redux
    const tableState = getTableState(request.tableKey)(store.getState());
    const sorting = tableState.sorting;

    return queryClient.fetchQuery({
      queryKey: ['table', request.tableKey, roundUuid, request.filter, sorting],
      queryFn: async () => {
        // First fetch the reviewers list
        const reviewersResponse = await callRoundsReviewersList({
          path: { uuid: roundUuid },
          query: {
            page: request.currentPage,
            page_size: request.pageSize,
            ...request.filter,
          },
        });

        const reviewers = reviewersResponse.data || [];

        // Fetch all reviews for this call
        const query: any = { page_size: 1000 };
        if (callUuid) {
          query.call_uuid = callUuid;
        }

        const allReviews = await proposalReviewsList({ query });

        const reviewsData = (allReviews.data || []).filter(
          (review) => review.round_uuid === roundUuid,
        );

        // Process each reviewer and add statistics
        let enhanced: EnhancedRoundReviewer[] = reviewers.map((reviewer) => {
          // Find all reviews for this reviewer
          const reviewerReviews = reviewsData.filter(
            (review) => review.reviewer_full_name === reviewer.full_name,
          );

          // Extract reviewer_uuid if available
          const reviewer_uuid = reviewerReviews[0]?.reviewer_uuid;

          // Count reviews by state
          const outstanding = reviewerReviews.filter(
            (r) => r.state === 'created',
          ).length;
          const declined = reviewerReviews.filter(
            (r) => r.state === 'rejected',
          ).length;
          const inProgress = reviewerReviews.filter(
            (r) => r.state === 'in_review',
          ).length;
          const submitted = reviewerReviews.filter(
            (r) => r.state === 'submitted',
          ).length;

          // Calculate average score for submitted reviews
          const submittedWithScores = reviewerReviews.filter(
            (r) => r.state === 'submitted' && r.summary_score != null,
          );
          const averageScore =
            submittedWithScores.length > 0
              ? submittedWithScores.reduce((sum, r) => sum + r.summary_score, 0) /
              submittedWithScores.length
              : undefined;

          // Calculate acceptance rate
          const totalDecisions =
            reviewer.accepted_proposals + reviewer.rejected_proposals;
          const acceptanceRate =
            totalDecisions > 0
              ? (reviewer.accepted_proposals / totalDecisions) * 100
              : undefined;

          return {
            ...reviewer,
            reviewer_uuid,
            outstanding_reviews: outstanding,
            declined_reviews: declined,
            in_progress_reviews: inProgress,
            submitted_reviews: submitted,
            average_score: averageScore,
            acceptance_rate: acceptanceRate,
            reviews: reviewerReviews, // Include pre-fetched reviews
          };
        });

        // Apply client-side sorting if requested
        if (sorting?.field) {
          const field = sorting.field;
          const mode = sorting.mode || 'asc';

          enhanced = [...enhanced].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            // Handle undefined/null values - sort them to the end
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // String comparison
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
              return mode === 'asc' ? comparison : -comparison;
            }

            // Numeric comparison
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return mode === 'asc' ? comparison : -comparison;
          });
        }

        // Return in the expected format with rows, resultCount, nextPage
        const resultCount = fetchResultCount(reviewersResponse);
        const nextPage = parseNextPage(reviewersResponse);

        return {
          rows: enhanced,
          resultCount,
          nextPage,
        };
      },
      staleTime: request.options?.staleTime,
    });
  };
};

const AcceptanceRateRenderer: FC<{ row: EnhancedRoundReviewer }> = ({ row }) => {
  const total = row.accepted_proposals + row.rejected_proposals;

  if (total === 0) {
    return <span className="text-muted">-</span>;
  }

  const rate = row.acceptance_rate || 0;
  const accepted = row.accepted_proposals;
  const rejected = row.rejected_proposals;

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="flex-grow-1">
        <div className="progress" style={{ height: '20px', minWidth: '100px' }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${rate}%` }}
            aria-valuenow={rate}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {rate > 15 && <small>{accepted}</small>}
          </div>
          <div
            className="progress-bar bg-danger"
            role="progressbar"
            style={{ width: `${100 - rate}%` }}
            aria-valuenow={100 - rate}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {100 - rate > 15 && <small>{rejected}</small>}
          </div>
        </div>
      </div>
      <small className="text-muted text-nowrap">
        {accepted}/{total}
      </small>
    </div>
  );
};

export const RoundReviewersList: FC<RoundReviewersListProps> = (props) => {
  const fetchData = useMemo(
    () => createEnhancedReviewersFetcher(props.round.uuid, props.call.uuid),
    [props.round.uuid, props.call.uuid],
  );

  const tableProps = useTable({
    table: 'RoundReviewersList',
    fetchData,
  });

  const columns: Column<EnhancedRoundReviewer>[] = [
    {
      title: translate('Full name'),
      render: ({ row }) => <>{row.full_name || '-'}</>,
      copyField: (row) => row.full_name,
      keys: ['full_name'],
      id: 'full_name',
      export: 'full_name',
      orderField: 'full_name',
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.email || '-'}</>,
      copyField: (row) => row.email,
      keys: ['email'],
      id: 'email',
      export: 'email',
      orderField: 'email',
      optional: true,
    },
    {
      title: translate('Outstanding'),
      render: ({ row }) => <>{row.outstanding_reviews ?? '-'}</>,
      keys: ['outstanding_reviews'],
      id: 'outstanding',
      export: (row) => row.outstanding_reviews ?? '-',
      orderField: 'outstanding_reviews',
    },
    {
      title: translate('In progress'),
      render: ({ row }) => <>{row.in_progress_reviews ?? '-'}</>,
      keys: ['in_progress_reviews'],
      id: 'in_progress',
      export: (row) => row.in_progress_reviews ?? '-',
      orderField: 'in_progress_reviews',
    },
    {
      title: translate('Submitted'),
      render: ({ row }) => <>{row.submitted_reviews ?? '-'}</>,
      keys: ['submitted_reviews'],
      id: 'submitted',
      export: (row) => row.submitted_reviews ?? '-',
      orderField: 'submitted_reviews',
    },
    {
      title: translate('Declined'),
      render: ({ row }) => <>{row.declined_reviews ?? '-'}</>,
      keys: ['declined_reviews'],
      id: 'declined',
      export: (row) => row.declined_reviews ?? '-',
      orderField: 'declined_reviews',
    },
    {
      title: translate('Accepted/Rejected'),
      render: AcceptanceRateRenderer,
      keys: ['accepted_proposals', 'rejected_proposals', 'acceptance_rate'],
      id: 'acceptance_rate',
      export: (row) => {
        const total = row.accepted_proposals + row.rejected_proposals;
        return total > 0 ? `${row.accepted_proposals}/${total}` : '-';
      },
      orderField: 'acceptance_rate',
      optional: true,
    },
    {
      title: translate('Avg. score'),
      render: ({ row }) => (
        <>
          {row.average_score != null ? row.average_score.toFixed(1) : '-'}
        </>
      ),
      keys: ['average_score'],
      id: 'average_score',
      export: (row) =>
        row.average_score != null ? row.average_score.toFixed(1) : '-',
      orderField: 'average_score',
    },
  ];

  return (
    <Table<EnhancedRoundReviewer>
      {...tableProps}
      id="reviewers"
      columns={columns}
      title={translate('Reviewers')}
      verboseName={translate('Reviewers')}
      expandableRow={ReviewerExpandableRow}
      hasOptionalColumns
      enableExport
      tableActions={
        <>
          <ReviewsExportButton
            roundUuid={props.round.uuid}
            callUuid={props.call.uuid}
            roundName={props.round.name}
          />
          <ImportAssignmentsButton
            round={props.round}
            call={props.call}
            refetch={tableProps.fetch}
          />
        </>
      }
    />
  );
};
