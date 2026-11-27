import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AIReportingNav } from './AIReportingNav';

// @uirouter/react is mocked globally, with includes() returning false.
vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn(),
}));
vi.mock('@/core/Link', () => ({
  // TabNav replaces the link's children with the title, so render them.
  Link: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

// The component reads canUseTool first, then isStaff.
const mockGates = (canUseTool: boolean, isStaff: boolean) => {
  vi.mocked(useSelector)
    .mockReturnValueOnce(canUseTool)
    .mockReturnValueOnce(isStaff);
};

describe('AIReportingNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when the user can neither use the tool nor see usage', () => {
    mockGates(false, false);
    const { container } = render(<AIReportingNav />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Chat, History and Files, but not Usage, for a user the tool is enabled for but who is not staff/support', () => {
    // A regular user allowed to use Chat must still get the nav.
    mockGates(true, false);
    render(<AIReportingNav />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.queryByText('Usage')).not.toBeInTheDocument();
  });

  it('shows only Usage for staff when the tool itself is disabled', () => {
    mockGates(false, true);
    render(<AIReportingNav />);
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByText('Files')).not.toBeInTheDocument();
  });

  it('shows all four for staff when the tool is also enabled', () => {
    mockGates(true, true);
    render(<AIReportingNav />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
  });
});
