import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@waldur/store/hooks';
import { UserDetails } from '@waldur/workspace/types';

import { updateUser } from '../support/api';

import { UserTokenLifetime } from './UserTokenLifetime';

vi.mock('@waldur/store/hooks');

vi.mock('../support/api');

describe('UserTokenLifetime component', () => {
  const mockUser: UserDetails = {
    uuid: 'test-uuid',
    token_lifetime: 3600,
    token: 'test-token',
  } as any;

  let showErrorResponseMock;
  let showSuccessMock;

  beforeEach(() => {
    showErrorResponseMock = vi.fn();
    showSuccessMock = vi.fn();

    vi.mocked(useNotify).mockReturnValue({
      showErrorResponse: showErrorResponseMock,
      showSuccess: showSuccessMock,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial values', () => {
    render(<UserTokenLifetime user={mockUser} />);

    // Check if the token is displayed as masked
    expect(screen.getByText(/\*\*\*\*\*\*/)).toBeInTheDocument();

    // Verify that the initial token lifetime value is selected
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('shows warning when "token will not timeout" option is selected', async () => {
    render(<UserTokenLifetime user={mockUser} />);

    // Open the select and choose the "no timeout" option
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText(/token will not timeout/i));

    // Check if the warning message appears
    expect(
      screen.getByText(/By setting token lifetime to indefinite/i),
    ).toBeInTheDocument();
  });

  it('calls updateUser API on form submit with the correct payload', async () => {
    vi.mocked(updateUser).mockResolvedValueOnce(null);

    render(<UserTokenLifetime user={mockUser} />);

    // Trigger the submit
    await userEvent.click(
      screen.getByRole('button', { name: /Save changes/i }),
    );

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(mockUser.uuid, {
        token_lifetime: 3600,
      });
      expect(showSuccessMock).toHaveBeenCalledWith('User has been updated');
    });
  });

  it('shows error message when API call fails', async () => {
    vi.mocked(updateUser).mockRejectedValue(new Error('API error'));

    render(<UserTokenLifetime user={mockUser} />);
    await userEvent.click(
      screen.getByRole('button', { name: /Save changes/i }),
    );

    await waitFor(() => {
      expect(showErrorResponseMock).toHaveBeenCalledWith(
        expect.any(Error),
        'User could not be updated',
      );
    });
  });
});
