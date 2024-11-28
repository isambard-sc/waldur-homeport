import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { TableInfo } from './TableInfo';

describe('TableInfo', () => {
  it('renders message for empty list', () => {
    render(<TableInfo currentPage={1} pageSize={10} resultCount={0} />);
    expect(
      screen.getByText('Showing 0 to 0 of 0 entries.'),
    ).toBeInTheDocument();
  });

  it('renders message for pagination', () => {
    render(<TableInfo currentPage={2} pageSize={10} resultCount={30} />);
    expect(
      screen.getByText('Showing 11 to 20 of 30 entries.'),
    ).toBeInTheDocument();
  });
});
