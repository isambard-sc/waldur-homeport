import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormCheck } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useToggle } from 'react-use';
import { Offering, Project, Resource } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/notify';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ProjectPreviewExpandableRow } from './ProjectPreviewExpandableRow';
import { parseProjectsAndResourcesFile } from './utils';

interface ImportedProject extends Project {
  resources: Resource[];
}

const ExpandableRow = (columns) =>
  memo(({ row }: { row: any }) => (
    <ProjectPreviewExpandableRow row={row} columns={columns} />
  ));

const projectColumns: Column<ImportedProject>[] = [
  {
    title: translate('Project name'),
    render: ({ row }) => <>{row.name}</>,
  },
  {
    title: translate('Start date'),
    render: ({ row }) => (
      <>{row.start_date ? formatDate(row.start_date) : 'N/A'}</>
    ),
  },
  {
    title: translate('End date'),
    render: ({ row }) => <>{row.end_date ? formatDate(row.end_date) : 'N/A'}</>,
  },
  {
    title: translate('Status'),
    render: ({ row }) => {
      const isOk = formatDate(row.start_date) && formatDate(row.end_date);

      return (
        <Badge variant={isOk && row.name ? 'success' : 'danger'} outline pill>
          {!row.name
            ? translate('Missing name')
            : !isOk
              ? translate('Missing date')
              : translate('OK')}
        </Badge>
      );
    },
  },
];

export const Step5PreviewAndImport: FC<WizardFormStepProps> = (props) => {
  const dispatch = useDispatch();
  const [data, setData] = useState<ImportedProject[]>([]);
  const [skipErrors, setSkipErrors] = useToggle(false);

  const resourcesCount = useMemo(
    () =>
      data.reduce((count, project) => count + project?.resources?.length, 0),
    [data],
  );

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file) {
        dispatch(showError('No file has been imported'));
        return;
      }
      parseProjectsAndResourcesFile(_file).then((_data) => setData(_data));
    },
    [dispatch, setData],
  );

  const refToolbar = useRef<HTMLDivElement>(null);

  const tableProps = useTable({
    table: 'ImportProjectsPreview',
    fetchData: (request) => {
      let rows = [...data];
      const q = (request.filter?.query || '').trim().toLowerCase();
      if (q) {
        rows = rows.filter((row) => row.name.toLowerCase().includes(q));
      }
      return Promise.resolve({
        rows,
        resultCount: rows.length,
      });
    },
    queryField: 'query',
  });

  const tooltip = useMemo(() => {
    if (!data?.length) {
      return translate('At least one project is required.');
    }
    const fixMessage = translate(
      'Please fix (step {step}) or skip records with errors',
      { step: 3 },
    );
    for (let i = 0; i < data.length; i++) {
      const project = data[i];
      let msg = '';
      if (!project.name) {
        msg = translate('Project name is required.');
      } else if (!formatDate(project.start_date)) {
        msg = translate('Start date is required.');
      } else if (!formatDate(project.end_date)) {
        msg = translate('End date is required.');
      }
      if (msg) return msg + ' ' + fixMessage;
    }
    return null;
  }, [data]);

  return (
    <WizardForm
      {...props}
      submitDisabled={!!tooltip && !skipErrors}
      submitTooltip={!skipErrors && tooltip}
    >
      {(wizardProps) => {
        const importType = wizardProps.formValues?.import_type;
        const offering = wizardProps.formValues?.offering as Offering;
        const file = wizardProps.formValues?.file;

        useEffect(() => {
          if (file?.length > 0) {
            parseCsvFile(file);
          }
        }, []);

        const resourceColumns = useMemo(
          () =>
            importType === 'projects_with_resources' && offering
              ? [
                  {
                    title: translate('Resource name'),
                    render: ({ row }) => <>{row.name}</>,
                  },
                ].concat(
                  offering.components.map((comp) => ({
                    title: comp.name,
                    render: ({ row }) => <>{row.limits[comp.type] || 'N/A'}</>,
                  })),
                  Object.keys(offering.attributes).map((attr) => ({
                    title: attr,
                    render: ({ row }) => <>{row.attributes[attr] || 'N/A'}</>,
                  })),
                )
              : null,
          [importType, offering],
        );

        const MemoizedExpandableRow = useMemo(
          () => ExpandableRow(resourceColumns),
          [resourceColumns],
        );

        return (
          <div>
            <div className="d-flex justify-content-start mb-3">
              <div ref={refToolbar}>{/* Portal destination */}</div>
            </div>
            <div className="d-flex justify-content-between text-muted mb-3">
              {importType === 'projects_only' ? (
                <span>
                  {data.length} {translate('Projects')}
                </span>
              ) : (
                <span>
                  {data.length} {translate('Projects')}, {resourcesCount}{' '}
                  {translate('Resources identified')}
                </span>
              )}
              <span>{translate('Verify your data before importing')}</span>
            </div>
            <Table
              {...tableProps}
              columns={projectColumns}
              verboseName={translate('Projects')}
              hasActionBar={false}
              fullWidth
              cardBordered={false}
              minHeight="auto"
              portal={{ toolbar: refToolbar?.current }}
              hasQuery
              expandableRow={
                importType === 'projects_with_resources'
                  ? MemoizedExpandableRow
                  : undefined
              }
              footer={
                Boolean(tooltip && data?.length) && (
                  <FormCheck
                    id="confirm-skip-errors"
                    type="checkbox"
                    className="form-check-custom form-check-sm border-top pt-3"
                    checked={skipErrors}
                    onChange={setSkipErrors}
                    label={translate('Skip records with errors')}
                  />
                )
              }
            />
          </div>
        );
      }}
    </WizardForm>
  );
};
