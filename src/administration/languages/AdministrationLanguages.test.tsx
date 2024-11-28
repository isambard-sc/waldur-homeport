import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@waldur/configs/default';

import * as api from '../settings/api';

import { AdministrationLanguages } from './AdministrationLanguages';

// Mock dependencies
vi.mock('@waldur/configs/default', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        LANGUAGE_CHOICES: ['en', 'et'],
      },
    },
    defaultLanguage: 'en',
    languageChoices: [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Estonian' },
    ],
  },
}));

vi.mock('@waldur/i18n', () => ({
  translate: (key: string) => key,
}));

vi.mock('@waldur/i18n/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    currentLanguage: { code: 'en' },
  }),
}));

vi.mock('@waldur/store/hooks', () => ({
  useNotify: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

describe('AdministrationLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all language options', () => {
    render(<AdministrationLanguages />);
    ENV.languageChoices.forEach((lang) => {
      expect(screen.getByText(lang.label)).toBeInTheDocument();
    });
  });

  it('prevents unselecting current language', async () => {
    render(<AdministrationLanguages />);
    const currentLangCheckbox = screen.getByTestId('language_en');

    await userEvent.click(currentLangCheckbox);

    expect(currentLangCheckbox).toBeChecked();
  });

  it('successfully saves language choices', async () => {
    const saveConfigMock = vi.spyOn(api, 'saveConfig').mockResolvedValue(null);
    const { getByText } = render(<AdministrationLanguages />);

    await userEvent.click(getByText('Save'));

    expect(saveConfigMock).toHaveBeenCalledWith({
      LANGUAGE_CHOICES: 'en,et',
    });
  });
});
