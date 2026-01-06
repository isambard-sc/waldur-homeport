import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  FileIcon,
  TrashIcon,
  UserListIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import Papa from 'papaparse';
import { FC, useCallback, useState } from 'react';
import { Alert, Button, Col, Row, Stack, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  proposalProposalsList,
  proposalProtectedCallsListUsersList,
  proposalReviewsCreate,
  proposalReviewsList,
  ProtectedRound,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { FileUploadField } from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { Call } from '@waldur/proposals/types';
import { useNotify } from '@waldur/store/hooks';
import { showError } from '@waldur/store/notify';
import saveAsCsv from '@waldur/table/exporters/csv';

interface AssignmentRow {
  proposal_id: string;
  reviewer_email: string;
}

interface MatchedAssignment {
  proposal_id: string;
  reviewer_email: string;
  proposal?: any;
  reviewer?: any;
  proposal_name?: string;
  reviewer_name?: string;
}

interface AssignmentError {
  proposal_id: string;
  reviewer_email: string;
  error: string;
}

interface ImportAssignmentsDialogProps {
  round: ProtectedRound;
  call: Call;
  refetch(): void;
}

const exampleFile = [
  { proposal_id: 'PROP-001', reviewer_email: 'john.doe@example.com' },
  { proposal_id: 'PROP-002', reviewer_email: 'jane.smith@example.com' },
];

export const ImportAssignmentsDialog: FC<ImportAssignmentsDialogProps> = ({
  round,
  call,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [file, setFile] = useState<File>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [matchedAssignments, setMatchedAssignments] = useState<
    MatchedAssignment[]
  >([]);
  const [errors, setErrors] = useState<AssignmentError[]>([]);
  const [importing, setImporting] = useState(false);
  const [processing, setProcessing] = useState(false);

  const parseCsvFile = useCallback(
    async (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file || _file.type !== 'text/csv') {
        dispatch(
          showError(translate('Invalid format, please import a .csv file')),
        );
        return;
      }
      setFile(_file);
      setProcessing(true);

      Papa.parse(_file, {
        complete: async function (results: { data: Array<Array<string>> }) {
          if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
            const proposalIdIndex = results.data[0].findIndex(
              (str) =>
                str.toLowerCase().includes('proposal') &&
                str.toLowerCase().includes('id'),
            );
            if (proposalIdIndex === -1) {
              dispatch(
                showError(translate('Unable to locate proposal_id column')),
              );
              setProcessing(false);
              return;
            }
            const reviewerEmailIndex = results.data[0].findIndex(
              (str) =>
                str.toLowerCase().includes('reviewer') &&
                str.toLowerCase().includes('email'),
            );

            if (reviewerEmailIndex === -1) {
              dispatch(
                showError(translate('Unable to locate reviewer_email column')),
              );
              setProcessing(false);
              return;
            }

            const items: AssignmentRow[] = [];
            // slice 1 to ignore csv header row
            results.data.slice(1).forEach((row) => {
              const proposal_id = row[proposalIdIndex]?.trim();
              const reviewer_email = row[reviewerEmailIndex]?.trim();
              if (proposal_id && reviewer_email) {
                items.push({ proposal_id, reviewer_email });
              }
            });
            setAssignments(items);

            // Now validate the assignments
            await validateAssignments(items);
          }
        },
      });
    },
    [dispatch, round.uuid, call.uuid],
  );

  const validateAssignments = async (items: AssignmentRow[]) => {
    try {
      // Fetch all proposals in this round
      const proposals = await getAllPages((page) =>
        proposalProposalsList({
          query: {
            round: round.uuid,
            page,
          },
        }),
      );

      // Fetch all reviewers for this call
      const reviewers = await getAllPages((page) =>
        proposalProtectedCallsListUsersList({
          path: { uuid: call.uuid },
          query: {
            page,
            role: RoleEnum.CALL_REVIEWER,
          },
        }),
      );

      const matched: MatchedAssignment[] = [];
      const validationErrors: AssignmentError[] = [];

      for (const item of items) {
        const proposal = proposals.find((p) => p.slug === item.proposal_id);
        const reviewer = reviewers.find(
          (r) => r.user_email.toLowerCase() === item.reviewer_email.toLowerCase(),
        );

        if (!proposal && !reviewer) {
          validationErrors.push({
            proposal_id: item.proposal_id,
            reviewer_email: item.reviewer_email,
            error: translate('Proposal and reviewer not found'),
          });
        } else if (!proposal) {
          validationErrors.push({
            proposal_id: item.proposal_id,
            reviewer_email: item.reviewer_email,
            error: translate('Proposal not found in this round'),
          });
        } else if (!reviewer) {
          validationErrors.push({
            proposal_id: item.proposal_id,
            reviewer_email: item.reviewer_email,
            error: translate('Reviewer not found'),
          });
        } else {
          matched.push({
            proposal_id: item.proposal_id,
            reviewer_email: item.reviewer_email,
            proposal,
            reviewer,
            proposal_name: proposal.name,
            reviewer_name: reviewer.user_full_name || reviewer.user_username,
          });
        }
      }

      setMatchedAssignments(matched);
      setErrors(validationErrors);
    } catch (error) {
      showErrorResponse(error, translate('Failed to validate assignments.'));
    } finally {
      setProcessing(false);
    }
  };

  const onDownloadClick = useCallback(() => {
    saveAsCsv('example_assignments', exampleFile);
  }, []);

  const removeFile = () => {
    setFile(null);
    setAssignments([]);
    setMatchedAssignments([]);
    setErrors([]);
  };

  const importAssignments = async () => {
    setImporting(true);
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const importErrors: string[] = [];

    try {
      // Fetch all existing reviews for this call
      const allReviews = await getAllPages((page) =>
        proposalReviewsList({
          query: {
            call_uuid: call.uuid,
            page,
          },
        }),
      );

      // Filter to only reviews for this round
      const existingReviewsData = allReviews.filter(
        (review) => review.round_uuid === round.uuid,
      );

      for (const assignment of matchedAssignments) {
        try {
          // Check if a review already exists for this proposal and reviewer
          const existingReview = existingReviewsData.find(
            (review) =>
              review.proposal_uuid === assignment.proposal.uuid &&
              review.reviewer_uuid === assignment.reviewer.user_uuid,
          );

          if (existingReview) {
            skippedCount++;
            continue;
          }

          // Create the review
          await proposalReviewsCreate({
            body: {
              proposal: assignment.proposal.url,
              reviewer: `${ENV.apiEndpoint}api/users/${assignment.reviewer.user_uuid}/`,
            },
          });
          successCount++;
        } catch (error) {
          errorCount++;
          importErrors.push(
            `${assignment.proposal_id} → ${assignment.reviewer_email}: ${error?.data?.non_field_errors?.[0] || 'Failed to create review'}`,
          );
        }
      }

      await refetch();

      // Build success message
      const messageParts = [];
      if (successCount > 0) {
        messageParts.push(
          translate('{count} assignment(s) imported', { count: successCount }),
        );
      }
      if (skippedCount > 0) {
        messageParts.push(
          translate('{count} already existed', { count: skippedCount }),
        );
      }

      if (errorCount === 0) {
        showSuccess(messageParts.join(', ') + '.');
        closeDialog();
      } else {
        messageParts.push(translate('{count} failed', { count: errorCount }));
        showSuccess(messageParts.join(', ') + '.');
        if (importErrors.length > 0) {
          dispatch(
            showError(
              translate('Errors: {errors}', {
                errors: importErrors.join('; '),
              }),
            ),
          );
        }
      }
    } catch (error) {
      showErrorResponse(error, translate('Failed to import assignments.'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModalDialog
      title={translate('Import assignments')}
      subtitle={translate(
        'Upload a CSV file to assign proposals to reviewers for review.',
      )}
      iconNode={<UserListIcon weight="bold" />}
      iconColor="primary"
      footer={
        <>
          <CloseDialogButton className="min-w-125px" />
          {file && matchedAssignments.length > 0 && (
            <Button
              variant="primary"
              className="min-w-125px"
              onClick={importAssignments}
              disabled={importing || processing}
            >
              {importing
                ? translate('Importing...')
                : translate('Import {count} assignment(s)', {
                    count: matchedAssignments.length,
                  })}
            </Button>
          )}
        </>
      }
    >
      {!file ? (
        <Row className="border rounded h-60px align-items-center mb-4 fs-6 mx-0">
          <Col>
            <p className="fs-6 fw-bold text-gray-700 mb-0">
              {translate('Upload CSV file')}
            </p>
            <p className="text-muted mb-0">
              {translate(
                'Import assignments from a .csv file. You can download an {example}',
                {
                  example: (
                    <button
                      className="text-anchor"
                      type="button"
                      onClick={onDownloadClick}
                    >
                      example_assignments.csv
                    </button>
                  ),
                },
                formatJsxTemplate,
              )}
            </p>
          </Col>
          <Col xs="auto">
            <FileUploadField
              input={{ onChange: (file) => parseCsvFile([file]) } as any}
              accept=".csv"
              buttonLabel={translate('Upload')}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              className="btn btn-secondary"
            />
          </Col>
        </Row>
      ) : (
        <>
          <div className="border rounded px-2 mb-4">
            <Row className="h-60px align-items-center gx-5 fs-6">
              <Col xs="auto" className="ps-6">
                <FileIcon weight="bold" size={22} className="text-muted" />
              </Col>
              <Col>
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="align-items-center fw-bold"
                >
                  <span className="fw-bold">{file.name}</span>
                  <CheckCircleIcon
                    size={16}
                    weight="fill"
                    className="text-success"
                  />
                </Stack>
                <p className="text-muted mb-0">
                  {translate('{count} assignment(s)', {
                    count: assignments.length,
                  })}
                </p>
              </Col>
              <Col xs="auto">
                <Button
                  variant="text-danger"
                  className="btn-icon"
                  onClick={removeFile}
                >
                  <span className="svg-icon svg-icon-1">
                    <TrashIcon weight="bold" />
                  </span>
                </Button>
              </Col>
            </Row>
          </div>

          {processing ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{translate('Loading...')}</span>
              </div>
              <p className="mt-3 text-muted">
                {translate('Validating assignments...')}
              </p>
            </div>
          ) : (
            <>
              {matchedAssignments.length > 0 && (
                <div className="border rounded p-4 mb-4">
                  <h6 className="mb-3 text-success">
                    <CheckCircleIcon
                      size={20}
                      weight="bold"
                      className="me-2"
                    />
                    {translate('Valid assignments ({count})', {
                      count: matchedAssignments.length,
                    })}
                  </h6>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th>{translate('Proposal ID')}</th>
                          <th>{translate('Proposal name')}</th>
                          <th>{translate('Reviewer email')}</th>
                          <th>{translate('Reviewer name')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchedAssignments.map((assignment, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">
                              {assignment.proposal_id}
                            </td>
                            <td>{assignment.proposal_name}</td>
                            <td>{assignment.reviewer_email}</td>
                            <td>{assignment.reviewer_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <Alert variant="danger">
                  <h6 className="mb-3">
                    <WarningCircleIcon
                      size={20}
                      weight="bold"
                      className="me-2"
                    />
                    {translate('Errors ({count})', { count: errors.length })}
                  </h6>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <Table bordered size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>{translate('Proposal ID')}</th>
                          <th>{translate('Reviewer email')}</th>
                          <th>{translate('Error')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errors.map((error, index) => (
                          <tr key={index}>
                            <td>{error.proposal_id}</td>
                            <td>{error.reviewer_email}</td>
                            <td>{error.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Alert>
              )}
            </>
          )}
        </>
      )}
    </ModalDialog>
  );
};
