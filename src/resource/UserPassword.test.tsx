import { fireEvent, render, screen } from '@testing-library/react';
import { describe, beforeEach, it, expect } from 'vitest';

import { UserPassword } from './UserPassword';

describe('UserPassword', () => {
  beforeEach(() => {
    render(<UserPassword password="secret" />);
  });

  it('renders placeholder and open eye icon by default', () => {
    expect(screen.getByText('***************')).toBeInTheDocument();
    expect(screen.getByTestId('eye')).toBeInTheDocument();
  });

  it('renders password and closed eye icon when user click on toggle icon', () => {
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(screen.getByTestId('eye-slash')).toBeInTheDocument();
  });
});
