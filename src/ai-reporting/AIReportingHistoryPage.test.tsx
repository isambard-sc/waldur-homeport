import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { router as globalRouter } from '@/router';
import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';

import { AIReportingHistoryPage } from './AIReportingHistoryPage';
import { openReportingSession } from './session';

vi.mock('./AIReportingNav', () => ({ AIReportingNav: () => null }));
vi.mock('./reportingSessionsApi', () => ({
  fetchReportingSessions: vi.fn(),
}));
vi.mock('./session', () => ({ openReportingSession: vi.fn() }));

// Table is stubbed out - this tests the page's wiring, not Table itself.
let tableRenderProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableRenderProps = props;
    return null;
  },
}));
vi.mock('@/table/useTable', () => ({ useTable: vi.fn() }));

describe('AIReportingHistoryPage', () => {
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
      AI_REPORTING_MESSAGE_RETENTION_DAYS: 30,
    };

    renderWithProviders(<AIReportingHistoryPage />);

    expect(
      screen.getByText(/30 days after they are created/),
    ).toBeInTheDocument();
  });

  it('falls back to a generic line when the retention period is not known', () => {
    renderWithProviders(<AIReportingHistoryPage />);

    expect(
      screen.getByText(
        'Conversations are deleted automatically after a while.',
      ),
    ).toBeInTheDocument();
  });

  it('wires a Conversation, Messages and Last activity column into Table', () => {
    renderWithProviders(<AIReportingHistoryPage />);

    const titles = tableRenderProps.columns.map((c: any) => c.title);
    expect(titles).toEqual(['Conversation', 'Messages', 'Last activity']);
  });

  it('makes rows clickable', () => {
    renderWithProviders(<AIReportingHistoryPage />);

    expect(tableRenderProps.hoverable).toBe(true);
    expect(typeof tableRenderProps.onRowClick).toBe('function');
  });

  const row = {
    uuid: 'session-uuid-1',
    created: '2026-01-01T00:00:00Z',
    last_activity: '2026-01-02T00:00:00Z',
    message_count: 3,
    first_prompt: 'can you create me a chart of active projects?',
    title: '',
  };

  it('opening a row opens that conversation in Chat', () => {
    renderWithProviders(<AIReportingHistoryPage />);

    tableRenderProps.onRowClick(row);

    expect(openReportingSession).toHaveBeenCalledWith(
      'session-uuid-1',
      expect.any(Function),
    );
    vi.mocked(openReportingSession).mock.calls[0][1]('reporting-ai-reporting');
    expect(globalRouter.stateService.go).toHaveBeenCalledWith(
      'reporting-ai-reporting',
    );
  });

  it('labels a conversation by its title, or its first question without one', () => {
    renderWithProviders(<AIReportingHistoryPage />);
    const cell = tableRenderProps.columns[0].render;

    render(<>{cell({ row: { ...row, title: 'Active projects chart' } })}</>);
    render(<>{cell({ row })}</>);

    expect(screen.getByText('Active projects chart')).toBeInTheDocument();
    expect(
      screen.getByText('can you create me a chart of active projects?'),
    ).toBeInTheDocument();
  });

  it('opens a conversation from the keyboard', async () => {
    renderWithProviders(<AIReportingHistoryPage />);
    render(<>{tableRenderProps.columns[0].render({ row })}</>);

    screen.getByRole('button', { name: /active projects/ }).focus();
    await userEvent.keyboard('{Enter}');

    expect(openReportingSession).toHaveBeenCalledWith(
      'session-uuid-1',
      expect.any(Function),
    );
  });
});
