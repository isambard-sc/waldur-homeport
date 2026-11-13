import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';

import { AIReportingFilesPage } from './AIReportingFilesPage';

vi.mock('./AIReportingNav', () => ({ AIReportingNav: () => null }));
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

  it('gives Table a delete row action', () => {
    renderWithProviders(<AIReportingFilesPage />);

    expect(typeof tableRenderProps.rowActions).toBe('function');
  });
});
