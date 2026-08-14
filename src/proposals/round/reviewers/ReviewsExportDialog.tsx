import { FileXlsIcon } from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { Button, Form, ProgressBar, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { proposalReviewsList, ProposalReview } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { useNotify } from '@waldur/store/hooks';
import exportAs from '@waldur/table/exporters';
import { ExportData } from '@waldur/table/exporters/types';

type ReviewState = 'created' | 'in_review' | 'submitted' | 'rejected';

interface ReviewsExportDialogProps {
  resolve: {
    roundUuid: string;
    callUuid: string;
    roundName?: string;
  };
}

export const ReviewsExportDialog: FC<ReviewsExportDialogProps> = ({
  resolve: { roundUuid, callUuid, roundName },
}) => {
  const dispatch = useDispatch();
  const { showError, showSuccess } = useNotify();
  const [selectedStates, setSelectedStates] = useState<Set<ReviewState>>(
    new Set(['submitted']),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const stateOptions = getReviewStateOptions();

  const toggleState = (state: ReviewState) => {
    const newStates = new Set(selectedStates);
    if (newStates.has(state)) {
      newStates.delete(state);
    } else {
      newStates.add(state);
    }
    setSelectedStates(newStates);
  };

  const handleExport = useCallback(async () => {
    if (selectedStates.size === 0) {
      showError(translate('Please select at least one review state'));
      return;
    }

    setIsExporting(true);
    setExportProgress(null);

    try {
      // Fetch all reviews for the call, following pagination — the backend
      // caps page_size, so a single request can silently miss reviews once
      // a call has more than one page's worth.
      setExportProgress({ current: 0, total: 1 });

      const reviewsData = await getAllPages((page) =>
        proposalReviewsList({
          query: {
            call_uuid: callUuid,
            page,
          },
        }),
      );

      const allReviews: ProposalReview[] = reviewsData.filter(
        (review) =>
          review.round_uuid === roundUuid &&
          selectedStates.has(review.state as ReviewState),
      );

      if (allReviews.length === 0) {
        showError(translate('No reviews found for the selected states'));
        setIsExporting(false);
        setExportProgress(null);
        return;
      }

      setExportProgress({ current: 1, total: 1 });

      // Sort reviews by proposal so reviews for the same proposal are contiguous
      const sortedReviews = [...allReviews].sort((a, b) => {
        const slugA = a.proposal_slug || '';
        const slugB = b.proposal_slug || '';
        return slugA.localeCompare(slugB);
      });

      // Calculate mean and variance of scores per proposal
      // (only considering reviews with a score)
      const proposalStats: Record<
        string,
        { mean: number | null; variance: number | null }
      > = {};

      // Group reviews by proposal and calculate stats
      const reviewsByProposal: Record<string, ProposalReview[]> = {};
      for (const review of sortedReviews) {
        const key = review.proposal_uuid;
        if (!reviewsByProposal[key]) {
          reviewsByProposal[key] = [];
        }
        reviewsByProposal[key].push(review);
      }

      // Generate unique random numbers for each proposal (for partial randomisation)
      // Uses crypto.getRandomValues for high-quality randomness
      const proposalRandomNumbers: Record<string, number> = {};
      const proposalUuids = Object.keys(reviewsByProposal);
      const usedNumbers = new Set<number>();

      for (const proposalUuid of proposalUuids) {
        let randomNum: number;
        do {
          // Generate a random number between 10000 and 99999 (5 digits)
          const array = new Uint32Array(1);
          crypto.getRandomValues(array);
          randomNum = 10000 + (array[0] % 90000);
        } while (usedNumbers.has(randomNum));
        usedNumbers.add(randomNum);
        proposalRandomNumbers[proposalUuid] = randomNum;
      }

      for (const [proposalUuid, reviews] of Object.entries(reviewsByProposal)) {
        // Only submitted reviews contribute to mean and variance
        const scores = reviews
          .filter((r) => r.state === 'submitted' && r.summary_score != null)
          .map((r) => r.summary_score as number);

        if (scores.length === 0) {
          proposalStats[proposalUuid] = { mean: null, variance: null };
        } else {
          const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
          const variance =
            scores.length > 1
              ? scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
                (scores.length - 1)
              : null;
          proposalStats[proposalUuid] = { mean, variance };
        }
      }

      // Prepare export data fields
      const fields = [
        translate('Proposal'),
        translate('Randomisation'),
        translate('Proposal name'),
        translate('Mean score'),
        translate('Score variance'),
        translate('Reviewer'),
        translate('Score'),
        translate('Public comment'),
        translate('Private comment'),
        // Section-specific comment fields
        translate('Comment: Title'),
        translate('Comment: Summary'),
        translate('Comment: Description'),
        translate('Comment: Duration'),
        translate('Comment: Research only'),
        translate('Comment: Confidential'),
        translate('Comment: Documentation'),
        translate('Comment: Resources'),
        translate('Comment: Team'),
        translate('State'),
      ];

      // Column widths in Excel character units
      // Wider columns for text-heavy fields like comments and names
      const columnWidths = [
        18, // Proposal
        15, // Randomisation
        40, // Proposal name
        12, // Mean score
        14, // Score variance
        25, // Reviewer
        10, // Score
        50, // Public comment
        50, // Private comment
        30, // Comment: Title
        50, // Comment: Summary
        50, // Comment: Description
        20, // Comment: Duration
        20, // Comment: Research only
        20, // Comment: Confidential
        30, // Comment: Documentation
        40, // Comment: Resources
        40, // Comment: Team
        12, // State
      ];

      // Prepare export data
      const exportData: ExportData = {
        fields,
        columnWidths,
        data: sortedReviews.map((review) => {
          const proposalUrl = `${window.location.origin}/proposals/${review.proposal_uuid}/`;
          const stats = proposalStats[review.proposal_uuid] || {
            mean: null,
            variance: null,
          };

          const row: any[] = [
            { formula: `HYPERLINK("${proposalUrl}","${review.proposal_slug}")` },
            proposalRandomNumbers[review.proposal_uuid] ?? '',
            review.proposal_name || '',
            stats.mean != null ? Number(stats.mean.toFixed(2)) : '',
            stats.variance != null ? Number(stats.variance.toFixed(2)) : '',
            review.reviewer_full_name || '',
            review.summary_score ?? '',
            review.summary_public_comment || '',
            review.summary_private_comment || '',
            // Section-specific comment fields
            review.comment_project_title || '',
            review.comment_project_summary || '',
            review.comment_project_description || '',
            review.comment_project_duration || '',
            review.comment_project_has_civilian_purpose || '',
            review.comment_project_is_confidential || '',
            review.comment_project_supporting_documentation || '',
            review.comment_resource_requests || '',
            review.comment_team || '',
            review.state || '',
          ];

          return row;
        }),
      };

      // Export to Excel
      const filename = roundName
        ? `reviews-${roundName.replace(/[^a-zA-Z0-9]/g, '-')}`
        : 'reviews';
      await exportAs('excel', filename, exportData);
      showSuccess(translate('Reviews exported successfully'));
      dispatch(closeModalDialog());
    } catch (error) {
      console.error('Error exporting reviews:', error);
      showError(translate('Failed to export reviews'));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [
    roundUuid,
    callUuid,
    roundName,
    selectedStates,
    showError,
    showSuccess,
    dispatch,
  ]);

  return (
    <ModalDialog
      title={translate('Export reviews')}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => dispatch(closeModalDialog())}
            disabled={isExporting}
          >
            {translate('Cancel')}
          </Button>
          <Button
            variant="primary"
            disabled={selectedStates.size === 0 || isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {translate('Downloading...')}
              </>
            ) : (
              <>
                <FileXlsIcon size={16} weight="bold" className="me-2" />
                {translate('Download')}
              </>
            )}
          </Button>
        </>
      }
    >
      <p className="text-muted mb-4">
        {translate(
          'Select the review states you want to include in the export:',
        )}
      </p>
      <div className="d-flex flex-column gap-3 mb-4">
        {stateOptions.map((option) => (
          <Form.Check
            key={option.value}
            type="checkbox"
            id={`review-state-${option.value}`}
            label={option.label}
            checked={selectedStates.has(option.value as ReviewState)}
            onChange={() => toggleState(option.value as ReviewState)}
            disabled={isExporting}
          />
        ))}
      </div>
      {exportProgress && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              {translate('Downloading reviews...')}
            </span>
            <span className="text-muted">
              {Math.round(
                (exportProgress.current / exportProgress.total) * 100,
              )}
              %
            </span>
          </div>
          <ProgressBar
            now={(exportProgress.current / exportProgress.total) * 100}
            variant="primary"
            animated
          />
        </div>
      )}
    </ModalDialog>
  );
};
