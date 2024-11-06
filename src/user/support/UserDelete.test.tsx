import { useQueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { waitForConfirmation } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';

import { deleteUser } from './api';
import { UserDelete } from './UserDelete';

vi.mock('react-redux');
vi.mock('@uirouter/react', () => ({
  useRouter: vi.fn(),
}));
vi.mock('@tanstack/react-query');
vi.mock('@waldur/modal/actions');
vi.mock('@waldur/navigation/useTabs', () => ({
  isDescendantOf: vi.fn(),
}));
vi.mock('@waldur/store/hooks');
vi.mock('./api');

describe('UserDelete', () => {
  let user;
  let dispatch;
  let router;
  let queryClient;
  let notify;

  beforeEach(() => {
    user = {
      uuid: 'test-uuid',
      full_name: 'Test User',
    };

    dispatch = vi.fn();
    vi.mocked(useDispatch).mockReturnValue(dispatch);

    router = {
      stateService: {
        go: vi.fn(),
      },
      globals: {
        current: 'admin-user-users',
      },
    };
    vi.mocked(useRouter).mockReturnValue(router);

    queryClient = {
      setQueryData: vi.fn(),
    };
    vi.mocked(useQueryClient).mockReturnValue(queryClient);

    notify = {
      showErrorResponse: vi.fn(),
      showSuccess: vi.fn(),
    };
    vi.mocked(useNotify).mockReturnValue(notify);
  });

  it('handles user deletion successfully', async () => {
    vi.mocked(waitForConfirmation).mockResolvedValueOnce(null);
    vi.mocked(deleteUser).mockResolvedValueOnce(null);

    render(<UserDelete user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(waitForConfirmation).toHaveBeenCalled();
      expect(deleteUser).toHaveBeenCalledWith('test-uuid');
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['UserDetails', 'test-uuid'],
        undefined,
      );
      expect(notify.showSuccess).toHaveBeenCalledWith('User has been deleted.');
      expect(router.stateService.go).toHaveBeenCalledWith('admin-user-users');
    });
  });

  it('proceeds only with confirmation', async () => {
    vi.mocked(waitForConfirmation).mockRejectedValueOnce(null);

    render(<UserDelete user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(waitForConfirmation).toHaveBeenCalled();
      expect(notify.showSuccess).not.toHaveBeenCalled();
      expect(router.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('handles user deletion failure', async () => {
    vi.mocked(waitForConfirmation).mockResolvedValueOnce(null);
    vi.mocked(deleteUser).mockRejectedValueOnce(new Error('Test error'));

    render(<UserDelete user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(waitForConfirmation).toHaveBeenCalled();
      expect(deleteUser).toHaveBeenCalledWith('test-uuid');
      expect(notify.showErrorResponse).toHaveBeenCalledWith(
        new Error('Test error'),
        'Unable to delete user.',
      );
    });
  });
});
