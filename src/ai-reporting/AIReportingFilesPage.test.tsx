import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';

import { AIReportingFilesPage } from './AIReportingFilesPage';
import { openReportingSession } from './session';

vi.mock('./AIReportingNav', () => ({ AIReportingNav: () => null }));
vi.mock('./session', () => ({ openReportingSession: vi.fn() }));
vi.mock('./reportingFilesApi', () => ({ fetchReportingFiles: vi.fn() }));

// Table is stubbed out - this tests the page's wiring, not Table itself.
let tableRenderProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableRenderProps = props;
    return null;
  },
}));
vi.mock('@/table/useTable', () => ({ useTable: vi.fn() }));

describe('AIReportingFilesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTable).mockReturnValue({
      rows: [],
      fetch: vi.fn(),
      query: '',
      filtersStorage: [],
    } as any);
    (ENV as any).plugins.WALDUR_CORE = {};
  });

  it('shows the configured retention period', () => {
    (ENV as any).plugins.WALDUR_CORE = {
      AI_REPORTING_FILE_RETENTION_DAYS: 21,
    };

    renderWithProviders(<AIReportingFilesPage />);

    expect(
      screen.getByText(/21 days after they are created/),
    ).toBeInTheDocument();
  });

  it('falls back to a generic line when the retention period is not known', () => {
    renderWithProviders(<AIReportingFilesPage />);

    expect(
      screen.getByText(
        'Files are deleted automatically after a while - delete one sooner here if you no longer need it.',
      ),
    ).toBeInTheDocument();
  });

  it('wires a Name, From question, Created and Download column into Table', () => {
    renderWithProviders(<AIReportingFilesPage />);

    const titles = tableRenderProps.columns.map((c: any) => c.title);
    expect(titles).toEqual(['Name', 'From question', 'Created', 'Download']);
  });

  const row = {
    uuid: 'file-1',
    name: 'chart.png',
    file: 'https://example.org/api/media/file-1/',
    created: '2026-01-01T00:00:00Z',
    session: 'session-1',
    prompt: 'can you create me a chart of active projects?',
    title: '',
  };

  it('labels a file by its question title, or the question without one', () => {
    renderWithProviders(<AIReportingFilesPage />);
    const cell = tableRenderProps.columns[1].render;

    render(<>{cell({ row: { ...row, title: 'Active projects chart' } })}</>);
    render(<>{cell({ row })}</>);

    expect(screen.getByText('Active projects chart')).toBeInTheDocument();
    expect(
      screen.getByText('can you create me a chart of active projects?'),
    ).toBeInTheDocument();
  });

  it('opens the conversation a file came from', async () => {
    renderWithProviders(<AIReportingFilesPage />);
    render(<>{tableRenderProps.columns[1].render({ row })}</>);

    await userEvent.click(
      screen.getByRole('button', { name: /active projects/ }),
    );

    expect(openReportingSession).toHaveBeenCalledWith(
      'session-1',
      expect.any(Function),
    );
  });

  it('names the download button after its file', () => {
    renderWithProviders(<AIReportingFilesPage />);
    render(<>{tableRenderProps.columns[3].render({ row })}</>);

    expect(
      screen.getByRole('button', { name: 'Download chart.png' }),
    ).toBeInTheDocument();
  });

  it('gives Table a delete row action', () => {
    renderWithProviders(<AIReportingFilesPage />);

    expect(typeof tableRenderProps.rowActions).toBe('function');
  });
});
