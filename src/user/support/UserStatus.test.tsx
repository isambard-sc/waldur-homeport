import { useQueryClient } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';

import { deactivateUser } from './api';
import { UserStatus } from './UserStatus';

vi.mock('./api');
vi.mock('@tanstack/react-query');
vi.mock('react-redux');
vi.mock('@waldur/modal/actions');
vi.mock('@waldur/store/hooks');

describe('UserStatus', () => {
  let user;
  let showErrorResponseMock;
  let showSuccessMock;

  beforeEach(() => {
    user = {
      uuid: 'abc123',
      full_name: 'John Doe',
      is_active: true,
    };

    showErrorResponseMock = vi.fn();
    showSuccessMock = vi.fn();

    vi.mocked(useQueryClient).mockReturnValue({
      setQueryData: vi.fn(),
    } as any);
    vi.mocked(useDispatch).mockReturnValue(vi.fn());
    vi.mocked(useNotify).mockReturnValue({
      showErrorResponse: showErrorResponseMock,
      showSuccess: showSuccessMock,
    } as any);
    vi.mocked(waitForConfirmation).mockResolvedValue(true);
  });

  it('renders the component with the enabled user', () => {
    render(<UserStatus user={user} />);
    expect(screen.getByText('Account status')).toBeInTheDocument();
    expect(screen.getByLabelText('Block')).not.toBeChecked();
  });

  it('deactivates user successfully', async () => {
    render(<UserStatus user={user} />);
    fireEvent.click(screen.getByLabelText('Block'));
    await waitFor(() => {
      expect(deactivateUser).toHaveBeenCalledWith('abc123');
      expect(showSuccessMock).toHaveBeenCalledWith(
        'User has been deactivated.',
      );
    });
  });

  it('handles the error when deactivating user', async () => {
    vi.mocked(deactivateUser).mockRejectedValue(new Error('Server error'));
    render(<UserStatus user={user} />);
    fireEvent.click(screen.getByLabelText('Block'));
    await waitFor(() => {
      expect(showErrorResponseMock).toHaveBeenCalledWith(
        new Error('Server error'),
        'Unable to toggle user status.',
      );
    });
  });

  it('renders the component with the disabled user', () => {
    render(<UserStatus user={{ ...user, is_active: false }} />);
    expect(screen.getByText('Account status')).toBeInTheDocument();
    expect(screen.getByLabelText('Block')).toBeChecked();
  });

  it('activates user successfully', async () => {
    render(<UserStatus user={{ ...user, is_active: false }} />);
    fireEvent.click(screen.getByLabelText('Block'));
    await waitFor(() => {
      expect(deactivateUser).toHaveBeenCalledWith('abc123');
      expect(showSuccessMock).toHaveBeenCalledWith('User has been activated.');
    });
  });
});
