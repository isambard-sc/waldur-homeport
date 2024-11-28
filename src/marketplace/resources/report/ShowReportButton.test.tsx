import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

import { ShowReportButton } from './ShowReportButton';

// Mock dependencies
vi.mock('@waldur/modal/hooks');
vi.mock('@waldur/i18n');

const mockReport = {
  id: 'report-1',
  name: 'Test Report',
};

describe('ShowReportButton', () => {
  let mockOpenDialog;

  beforeEach(() => {
    mockOpenDialog = vi.fn();
    vi.mocked(useModal).mockReturnValue({ openDialog: mockOpenDialog } as any);
    vi.mocked(translate).mockReturnValue('Show report');
  });

  it('renders nothing when report is not provided', () => {
    render(<ShowReportButton report={null} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders button when report is provided', () => {
    render(<ShowReportButton report={mockReport as any} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Show report')).toBeInTheDocument();
  });

  it('opens dialog when clicked', async () => {
    render(<ShowReportButton report={mockReport as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockOpenDialog).toHaveBeenCalled();
  });
});
