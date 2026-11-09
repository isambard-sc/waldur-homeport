import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AIReportingNav } from './AIReportingNav';

// @uirouter/react is already mocked globally (test/mocks/router.js) with
// stateService.includes() defaulting to false - exactly what's needed here.
vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn(),
}));
vi.mock('@/core/Link', () => ({
  // TabNav clones `link` and replaces its children with `title` - the mock
  // must actually render whatever children it's given, not a fixed value.
  Link: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

// canUseTool (isAIReportingEnabledForUser) is read first, isStaff
// (isStaffOrSupport) second - matches the component's own call order.
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
    // Reproduces a real bug: AI_REPORTING_ENABLED_ROLES="all" lets a regular
    // user reach Chat/Files, but the nav used to hide itself entirely for
    // anyone who wasn't staff/support, leaving that user with no way to
    // switch between the pages they could actually reach.
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
