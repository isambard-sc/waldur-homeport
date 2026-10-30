import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ReviewReturnedNotice } from './ReviewReturnedNotice';

describe('ReviewReturnedNotice', () => {
  it('tells the reviewer why the review came back', () => {
    renderWithProviders(
      <ReviewReturnedNotice
        review={{
          state: 'in_review',
          return_reason: 'Please score section 2.',
          returned_at: '2026-10-01T10:00:00Z',
        }}
      />,
    );
    expect(screen.getByTestId('review-returned-notice')).toHaveTextContent(
      /The call managers returned this review to you on .*Please score section 2\./,
    );
  });

  it('is gone once the review is submitted again', () => {
    renderWithProviders(
      <ReviewReturnedNotice
        review={{
          state: 'submitted',
          return_reason: 'Please score section 2.',
          returned_at: '2026-10-01T10:00:00Z',
        }}
      />,
    );
    expect(
      screen.queryByTestId('review-returned-notice'),
    ).not.toBeInTheDocument();
  });
});
