import { screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customersRetrieve,
  formFlowsList,
  siteClosingFormFlowRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SiteClosingFlowCard } from './SiteClosingFlowCard';

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn(),
}));

describe('SiteClosingFlowCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSelector).mockReturnValue(true);
    vi.mocked(formFlowsList).mockResolvedValue({ data: [] } as any);
  });

  it('shows the site flow, when it opens and the organisations it covers', async () => {
    vi.mocked(siteClosingFormFlowRetrieve).mockResolvedValue({
      data: {
        flow: 'c',
        flow_key: 'airr-end',
        flow_name: 'AIRR end of project',
        closing_forms_open_days_before_end: 14,
        customers: ['org-1'],
      },
    } as any);
    vi.mocked(customersRetrieve).mockResolvedValue({
      data: { uuid: 'org-1', name: 'AIRR' },
    } as any);
    renderWithProviders(<SiteClosingFlowCard />);

    expect(await screen.findByText('AIRR end of project')).toBeInTheDocument();
    expect(screen.getByText('14 days before the end date')).toBeInTheDocument();
    expect(await screen.findByText('AIRR')).toBeInTheDocument();
  });

  it('covers every organisation when none are picked', async () => {
    vi.mocked(siteClosingFormFlowRetrieve).mockResolvedValue({
      data: {
        flow: null,
        flow_key: null,
        flow_name: null,
        closing_forms_open_days_before_end: 0,
        customers: [],
      },
    } as any);
    renderWithProviders(<SiteClosingFlowCard />);
    expect(await screen.findByText('All organisations')).toBeInTheDocument();
    expect(screen.getByText('On the end date')).toBeInTheDocument();
  });
});
