import { DownloadSimpleIcon, FileArrowUpIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  proposalProtectedCallsImportReviewAssignments,
  proposalProtectedCallsRoundsList,
  ReviewAssignmentImportRow,
} from 'waldur-js-client';

import { AlertItem, Badge, BaseButton, BadgeVariant, Select } from 'waldur-ui';

import { formDataOptions } from '@/core/api';
import { saveFile } from '@/core/saveFile';
import { FileUploadField, FormGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface ImportAssignmentsDialogProps {
  resolve: {
    call: Pick<Call, 'uuid' | 'slug'>;
    /** The round to start from: the reviews list's round filter, if any. */
    roundUuid?: string;
    refetch?(): void;
  };
}

const EXAMPLE_CSV = [
  'proposal_id,reviewer_email',
  'PROP-001,john.doe@example.com',
  'PROP-002,jane.smith@example.com',
].join('\n');

export const downloadExample = () =>
  saveFile(
    new Blob([EXAMPLE_CSV], { type: 'text/csv;charset=utf-8' }),
    'review-assignments-example.csv',
  );

const STATUS: Record<
  ReviewAssignmentImportRow['status'],
  { label: () => string; variant: BadgeVariant }
> = {
  ready: { label: () => translate('Ready'), variant: 'success' },
  created: { label: () => translate('Created'), variant: 'success' },
  skipped: { label: () => translate('Skipped'), variant: 'neutral' },
  error: { label: () => translate('Error'), variant: 'danger' },
};

/** How the rows came out, for the summary. */
export const countRows = (rows: ReviewAssignmentImportRow[]) => ({
  ready: rows.filter((row) => row.status === 'ready').length,
  created: rows.filter((row) => row.status === 'created').length,
  skipped: rows.filter((row) => row.status === 'skipped').length,
  error: rows.filter((row) => row.status === 'error').length,
});

const ResultsTable: FC<{ rows: ReviewAssignmentImportRow[] }> = ({ rows }) => {
  const tableProps = useTable({
    table: 'review-assignment-import',
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });
  const columns: Column<ReviewAssignmentImportRow>[] = [
    { title: translate('Line'), render: ({ row }) => row.line },
    {
      title: translate('Proposal'),
      render: ({ row }) => (
        <>
          <div className="fw-semibold">{row.proposal_id}</div>
          <div className="text-muted fs-7">
            {renderFieldOrDash(row.proposal_name)}
          </div>
        </>
      ),
    },
    {
      title: translate('Reviewer'),
      render: ({ row }) => (
        <>
          <div>{row.reviewer_email}</div>
          <div className="text-muted fs-7">
            {renderFieldOrDash(row.reviewer_name)}
          </div>
        </>
      ),
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <Badge variant={STATUS[row.status].variant} shape="pill">
          {STATUS[row.status].label()}
        </Badge>
      ),
    },
    {
      title: translate('Details'),
      render: ({ row }) => renderFieldOrDash(row.detail),
    },
  ];
  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('assignments')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

/**
 * Assigns reviewers to a round's proposals from a CSV of proposal IDs and
 * reviewer emails. The file is checked first (nothing is created), and the
 * valid rows are then imported in a second step, with the same file. The
 * backend matches each row and applies the call's rules: the proposal is in
 * the round and submitted, the reviewer is one of the call's, not on the
 * proposal's team, and within the reviewer pool's workload.
 */
export const ImportAssignmentsDialog: FC<ImportAssignmentsDialogProps> = ({
  resolve: { call, roundUuid, refetch },
}) => {
  const { showSuccess, showError, showErrorResponse } = useNotify();
  const [round, setRound] = useState<string | undefined>(roundUuid);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ReviewAssignmentImportRow[] | null>(null);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: rounds } = useQuery({
    queryKey: ['CallRounds', call.uuid],
    queryFn: () =>
      proposalProtectedCallsRoundsList({ path: { uuid: call.uuid } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });
  const roundOptions = useMemo(
    () =>
      (rounds ?? []).map((item) => ({ value: item.uuid, label: item.name })),
    [rounds],
  );

  const send = async (roundValue: string, upload: File, apply: boolean) => {
    setBusy(true);
    try {
      const { data } = await proposalProtectedCallsImportReviewAssignments({
        path: { uuid: call.uuid },
        body: { round: roundValue, file: upload, apply },
        ...formDataOptions,
      });
      return data;
    } catch (error) {
      showErrorResponse(
        error,
        apply
          ? translate('Unable to import the assignments.')
          : translate('Unable to check the file.'),
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  // Checked as soon as there is both a round and a file.
  const check = async (roundValue?: string, upload?: File | null) => {
    setRows(null);
    setApplied(false);
    if (!roundValue || !upload) return;
    const result = await send(roundValue, upload, false);
    if (result) setRows(result);
  };

  const importRows = async () => {
    const result = await send(round, file, true);
    if (!result) return;
    setRows(result);
    setApplied(true);
    const counts = countRows(result);
    const summary = translate(
      '{created} imported, {skipped} already existed, {error} failed.',
      counts,
    );
    if (counts.error) {
      showError(summary);
    } else {
      showSuccess(summary);
    }
    refetch?.();
  };

  const counts = rows ? countRows(rows) : null;

  return (
    <ModalDialog
      title={translate('Import assignments')}
      subtitle={translate(
        "Assign reviewers to a round's proposals from a CSV file with a proposal_id column (the proposal ID shown in Waldur) and a reviewer_email column. Each reviewer is emailed, as when assigned by hand.",
      )}
      iconNode={<FileArrowUpIcon weight="bold" />}
      footer={
        <>
          <CloseDialogButton label={applied ? translate('Close') : undefined} />
          {!applied && (
            <BaseButton
              variant="primary"
              onClick={importRows}
              pending={busy && Boolean(rows)}
              disabled={!counts?.ready || busy}
              disabledReason={
                busy
                  ? translate('Checking the file…')
                  : translate('There are no valid assignments to import.')
              }
              label={translate('Import {count} assignment(s)', {
                count: counts?.ready ?? 0,
              })}
            />
          )}
        </>
      }
    >
      <FormGroup label={translate('Round')} required>
        <Select
          inputId="import-round"
          aria-label={translate('Round')}
          options={roundOptions}
          value={roundOptions.find((option) => option.value === round) ?? null}
          onChange={(option: { value: string } | null) => {
            setRound(option?.value);
            check(option?.value, file);
          }}
          placeholder={translate('Select round...')}
          isDisabled={busy || applied}
        />
      </FormGroup>
      <FormGroup
        label={translate('File')}
        required
        description={translate(
          'Columns are matched by name, so "Proposal ID" and "Reviewer Email" work too.',
        )}
      >
        <div className="d-flex flex-wrap align-items-center gap-3">
          <FileUploadField
            input={{
              name: 'file',
              value: file,
              onChange: (upload: File | null) => {
                setFile(upload);
                check(round, upload);
              },
              onBlur: () => undefined,
              onFocus: () => undefined,
            }}
            meta={{}}
            accept=".csv,text/csv"
            buttonLabel={translate('Choose CSV file')}
            showFileName
            disabled={busy || applied}
          />
          <BaseButton
            variant="text-primary"
            size="sm"
            iconNode={<DownloadSimpleIcon weight="bold" />}
            label={translate('Download example')}
            onClick={downloadExample}
          />
        </div>
      </FormGroup>
      {file && !round && (
        <AlertItem
          variant="info"
          className="mb-5"
          title={translate('Choose the round the file assigns.')}
        />
      )}
      {counts && (
        <>
          <p className="fw-semibold mb-3">
            {applied
              ? translate(
                  '{created} imported, {skipped} already existed, {error} failed.',
                  counts,
                )
              : translate(
                  '{ready} ready to import, {skipped} skipped, {error} with errors.',
                  counts,
                )}
          </p>
          <ResultsTable key={applied ? 'applied' : 'checked'} rows={rows} />
        </>
      )}
    </ModalDialog>
  );
};
