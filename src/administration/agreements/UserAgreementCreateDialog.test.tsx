import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import { post } from '@waldur/core/api';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { UserAgreementCreateDialog } from './UserAgreementCreateDialog';

vi.mock('@waldur/core/api');
vi.mock('@waldur/store/hooks');
vi.mock('@waldur/modal/hooks');
vi.mock('@waldur/i18n', () => ({
  translate: (message) => message,
}));

describe('UserAgreementCreateDialog', () => {
  const mockCloseDialog = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockResolveRefetch = vi.fn();

  beforeEach(() => {
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
    } as any);
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits the form successfully', async () => {
    vi.mocked(post);
    render(
      <UserAgreementCreateDialog resolve={{ refetch: mockResolveRefetch }} />,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Privacy policy'));
    await userEvent.type(
      screen.getByLabelText('Content'),
      'Test agreement content',
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/user-agreements/', {
        agreement_type: 'PP',
        content: 'Test agreement content',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'User agreement has been created',
      );
      expect(mockCloseDialog).toHaveBeenCalled();
      expect(mockResolveRefetch).toHaveBeenCalled();
    });
  });
});
