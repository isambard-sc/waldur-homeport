import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectGracePeriodBanner } from './ProjectGracePeriodBanner';

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn().mockReturnValue(false),
  useDispatch: () => vi.fn(),
}));

const project = (overrides = {}): any => ({
  uuid: 'p1',
  end_date: '2026-12-31',
  effective_end_date: '2027-01-30',
  grace_period_days: 30,
  is_in_grace_period: true,
  ...overrides,
});

const renderOn = (iso: string, overrides = {}) => {
  vi.setSystemTime(new Date(`${iso}T09:00:00`));
  return render(<ProjectGracePeriodBanner project={project(overrides)} />);
};

describe('ProjectGracePeriodBanner', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }));
  afterEach(() => vi.useRealTimers());

  it('asks for contact no later than the inclusive deadline', () => {
    renderOn('2027-01-05');

    expect(
      screen.getByText(/contact the allocator of your project no later than/),
    ).toHaveTextContent('20 Jan 2027');
    expect(screen.queryByText(/Today is the last day/)).toBeNull();
  });

  it('still invites a request on the last day, and says so', () => {
    renderOn('2027-01-20');

    expect(
      screen.getByText(/contact the allocator of your project no later than/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Today is the last day to ask the allocator for an extension.',
      ),
    ).toBeInTheDocument();
  });

  // One rule, as in the emails: there is no second, 5-day deadline.
  it('names no rejection deadline', () => {
    renderOn('2027-01-05');

    expect(screen.queryByText(/will be rejected/)).toBeNull();
  });

  it('says the grace period cannot be extended once the deadline has passed', () => {
    renderOn('2027-01-21');

    expect(screen.getByText(/cannot be extended/)).toHaveTextContent(
      '29 Jan 2027',
    );
    expect(screen.queryByText(/no later than/)).toBeNull();
  });

  // A 5-day grace period never had a deadline in its future; the banner must
  // not name one that has already gone.
  it('shows a short grace period as not extendable, with no past date', () => {
    renderOn('2027-01-02', {
      effective_end_date: '2027-01-05',
      grace_period_days: 5,
    });

    expect(screen.getByText(/cannot be extended/)).toHaveTextContent(
      '4 Jan 2027',
    );
    expect(screen.queryByText(/26 Dec 2026|31 Dec 2026/)).toBeNull();
  });

  // The API says is_in_grace_period is false on the end date, but access has
  // ended and the email has gone out, so the banner shows.
  it('shows on the end date itself', () => {
    renderOn('2026-12-31', { is_in_grace_period: false });

    expect(
      screen.getByText(/project is now in its grace period/),
    ).toBeInTheDocument();
  });

  it('shows nothing before the end date', () => {
    const { container } = renderOn('2026-12-30', {
      is_in_grace_period: false,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
