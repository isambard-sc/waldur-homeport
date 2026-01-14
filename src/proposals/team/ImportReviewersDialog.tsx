import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  FileArrowUpIcon,
  FileIcon,
  TrashIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import Papa from 'papaparse';
import { FC, useCallback, useState } from 'react';
import { Button, Col, Row, Stack, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsListUsersList } from 'waldur-js-client';

import { getAllPages, post } from '@waldur/core/api';
import { FileUploadField } from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RoleEnum } from '@waldur/permissions/enums';
import { useNotify } from '@waldur/store/hooks';
import { showError } from '@waldur/store/notify';
import saveAsCsv from '@waldur/table/exporters/csv';

import { createProposalUser } from './api';

interface ReviewerRow {
  email: string;
  first_name: string;
  last_name: string;
}

interface ImportReviewersDialogProps {
  scope: { url: string; uuid: string };
  refetch(): void;
}

const exampleFile = [
  { email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe' },
  { email: 'jane.smith@example.com', first_name: 'Jane', last_name: 'Smith' },
];

export const ImportReviewersDialog: FC<ImportReviewersDialogProps> = ({
  scope,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [file, setFile] = useState<File>(null);
  const [reviewers, setReviewers] = useState<ReviewerRow[]>([]);
  const [importing, setImporting] = useState(false);

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file || _file.type !== 'text/csv') {
        dispatch(showError(translate('Invalid format, please import a .csv file')));
        return;
      }
      setFile(_file);
      Papa.parse(_file, {
        complete: function (results: { data: Array<Array<string>> }) {
          if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
            const emailIndex = results.data[0].findIndex((str) =>
              str.toLowerCase().includes('mail'),
            );
            if (emailIndex === -1) {
              dispatch(showError(translate('Unable to locate email column')));
              return;
            }
            const firstNameIndex = results.data[0].findIndex((str) =>
              str.toLowerCase().includes('first'),
            );
            const lastNameIndex = results.data[0].findIndex((str) =>
              str.toLowerCase().includes('last'),
            );

            if (firstNameIndex === -1 || lastNameIndex === -1) {
              dispatch(
                showError(translate('Unable to locate first_name or last_name columns')),
              );
              return;
            }

            const items: ReviewerRow[] = [];
            // slice 1 to ignore csv header row
            results.data.slice(1).forEach((row) => {
              const email = row[emailIndex]?.trim();
              const first_name = row[firstNameIndex]?.trim();
              const last_name = row[lastNameIndex]?.trim();
              if (email && first_name && last_name) {
                items.push({ email, first_name, last_name });
              }
            });
            setReviewers(items);
          }
        },
      });
    },
    [dispatch],
  );

  const onDownloadClick = useCallback(() => {
    saveAsCsv('example_reviewers', exampleFile);
  }, []);

  const removeFile = () => {
    setFile(null);
    setReviewers([]);
  };

  const importReviewers = async () => {
    setImporting(true);
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // First, fetch all existing reviewers for this call
      const existingReviewers = await getAllPages((page) =>
        proposalProtectedCallsListUsersList({
          path: { uuid: scope.uuid },
          query: {
            page,
            role: RoleEnum.CALL_REVIEWER,
          },
        }),
      );

      // Create a Set of existing reviewer emails for quick lookup
      const existingEmails = new Set(
        existingReviewers.map((r) => r.user_email.toLowerCase()),
      );

      for (const reviewer of reviewers) {
        try {
          // Check if user is already a reviewer
          if (existingEmails.has(reviewer.email.toLowerCase())) {
            skippedCount++;
            continue;
          }

          // Create or get existing user
          const user = await createProposalUser({
            email: reviewer.email,
            first_name: reviewer.first_name,
            last_name: reviewer.last_name,
          });

          // Add user as reviewer to the call
          try {
            await post(`${scope.url}add_user/`, {
              user: user.uuid,
              role: RoleEnum.CALL_REVIEWER,
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(
              `${reviewer.email}: ${error?.data?.non_field_errors?.[0] || 'Failed to add as reviewer'}`,
            );
          }
        } catch (error) {
          errorCount++;
          errors.push(`${reviewer.email}: Failed to create/find user`);
        }
      }

      await refetch();

      // Build success message
      const messageParts = [];
      if (successCount > 0) {
        messageParts.push(
          translate('{count} reviewer(s) imported', { count: successCount }),
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
        if (errors.length > 0) {
          dispatch(
            showError(
              translate('Errors: {errors}', { errors: errors.join('; ') }),
            ),
          );
        }
      }
    } catch (error) {
      showErrorResponse(error, translate('Failed to import reviewers.'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModalDialog
      title={translate('Import reviewers')}
      subtitle={translate(
        'Upload a CSV file to import reviewers. Users will be created automatically if they don\'t exist.',
      )}
      iconNode={<UsersThreeIcon weight="bold" />}
      iconColor="primary"
      footer={
        <>
          <CloseDialogButton className="min-w-125px" />
          {file && reviewers.length > 0 && (
            <Button
              variant="primary"
              className="min-w-125px"
              onClick={importReviewers}
              disabled={importing}
            >
              {importing
                ? translate('Importing...')
                : translate('Import {count} reviewer(s)', {
                    count: reviewers.length,
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
                'Import reviewers from a .csv file. You can download an {example}',
                {
                  example: (
                    <button
                      className="text-anchor"
                      type="button"
                      onClick={onDownloadClick}
                    >
                      example_reviewers.csv
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
                  {translate('{count} reviewer(s)', { count: reviewers.length })}
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

          {reviewers.length > 0 && (
            <div className="border rounded p-4">
              <h6 className="mb-3">{translate('Preview')}</h6>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>{translate('Email')}</th>
                      <th>{translate('First name')}</th>
                      <th>{translate('Last name')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewers.map((reviewer, index) => (
                      <tr key={index}>
                        <td>{reviewer.email}</td>
                        <td>{reviewer.first_name}</td>
                        <td>{reviewer.last_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </ModalDialog>
  );
};
