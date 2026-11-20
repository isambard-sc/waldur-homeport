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
    expect(
      screen.getByText(/the earlier you ask, the more likely/),
    ).toBeInTheDocument();
    expect(screen.getByText(/will need evidence/)).toBeInTheDocument();
    expect(screen.queryByText(/Today is the last day/)).toBeNull();
  });

  it('still invites a request on the last day, and says so', () => {
    renderOn('2027-01-20');

    expect(
      screen.getByText(/you must contact the allocator of your project TODAY/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Today is the last day that a change to the grace period can be requested/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/After today, an extension is unlikely/),
    ).toBeInTheDocument();
    expect(screen.getByText(/will need evidence/)).toBeInTheDocument();
  });

  // Soft, as the emails are: a late request is unlikely to succeed, never
  // ruled out.
  it('uses no absolute wording', () => {
    for (const day of ['2027-01-05', '2027-01-20', '2027-01-25']) {
      const { unmount } = renderOn(day);
      expect(screen.queryByText(/will be rejected/)).toBeNull();
      expect(screen.queryByText(/cannot be extended/)).toBeNull();
      unmount();
    }
  });

  it('says a late extension is unlikely once the deadline has passed', () => {
    renderOn('2027-01-21');

    expect(screen.getByText(/that date has now passed/)).toBeInTheDocument();
    expect(
      screen.getByText(/unlikely unless there are exceptional circumstances/),
    ).toBeInTheDocument();
    expect(screen.getByText(/explain what has happened/)).toBeInTheDocument();
    expect(
      screen.getByText(/copied back all of your data by the end of/),
    ).toHaveTextContent('29 Jan 2027');
    // "Explain what has happened" takes the place of the evidence sentence.
    expect(screen.queryByText(/will need evidence/)).toBeNull();
    expect(screen.queryByText(/no later than/)).toBeNull();
  });

  // A 5-day grace period never had a deadline in its future; the banner must
  // not name one that has already gone.
  it('shows a short grace period as past its deadline, with no past date', () => {
    renderOn('2027-01-02', {
      effective_end_date: '2027-01-05',
      grace_period_days: 5,
    });

    expect(screen.getByText(/that date has now passed/)).toBeInTheDocument();
    expect(
      screen.getByText(/copied back all of your data by the end of/),
    ).toHaveTextContent('4 Jan 2027');
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
