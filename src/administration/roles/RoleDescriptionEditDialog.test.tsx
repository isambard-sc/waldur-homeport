import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@waldur/configs/default';

import * as api from './api';
import { RoleDescriptionEditDialog } from './RoleDescriptionEditDialog';

// Mock dependencies
vi.mock('@waldur/modal/hooks', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
}));

vi.mock('@waldur/i18n', () => ({
  translate: (key) => key,
}));

describe('RoleDescriptionEditDialog', () => {
  const mockRow = {
    uuid: 'test-uuid',
    description_en: 'English description',
    description_et: 'Estonian description',
  };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.languageChoices = [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Estonian' },
    ];
  });

  it('renders form with language inputs', () => {
    render(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Estonian')).toBeInTheDocument();
    expect(screen.getByDisplayValue('English description')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Estonian description'),
    ).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    const updateRoleDescriptionsSpy = vi
      .spyOn(api, 'updateRoleDescriptions')
      .mockResolvedValue(undefined);
    const getRolesSpy = vi.spyOn(api, 'getRoles').mockResolvedValue([]);

    render(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    const englishInput = screen.getByDisplayValue('English description');
    await user.clear(englishInput);
    await user.type(englishInput, 'Updated English description');

    const submitButton = screen.getByText('Save');
    await user.click(submitButton);

    expect(updateRoleDescriptionsSpy).toHaveBeenCalledWith('test-uuid', {
      description_en: 'Updated English description',
      description_et: 'Estonian description',
    });
    expect(getRolesSpy).toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });
});
