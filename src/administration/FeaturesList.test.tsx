import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, beforeEach, it } from 'vitest';

import { post } from '@waldur/core/api';
import { useNotify } from '@waldur/store/hooks';

import { FeaturesList } from './FeaturesList';

// Mock dependencies
vi.mock('@waldur/core/api');
vi.mock('@waldur/store/hooks', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));
vi.mock('@waldur/i18n', () => ({
  translate: (message) => message,
}));
vi.mock('@waldur/features/FeaturesDescription', () => ({
  FeaturesDescription: [
    {
      key: 'billing',
      description: 'Billing features',
      items: [
        {
          key: 'enabled',
          description: 'Enable billing functionality',
        },
      ],
    },
    {
      key: 'support',
      description: 'Support features',
      items: [
        {
          key: 'enabled',
          description: 'Enable support functionality',
        },
      ],
    },
  ],
}));
vi.mock('@waldur/configs/default', () => ({
  ENV: {
    FEATURES: {
      billing: {
        enabled: true,
      },
      support: {
        enabled: false,
      },
    },
  },
}));

describe('FeaturesList', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock notifications
    const mockShowSuccess = vi.fn();
    const mockShowErrorResponse = vi.fn();
    vi.mocked(useNotify).mockReturnValue({
      showError: vi.fn(),
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    });

    // Mock post function
    vi.mocked(post).mockReset();

    vi.spyOn(window, 'location', 'get');
  });

  it('renders all feature sections', () => {
    render(<FeaturesList />);

    // Check if section titles are rendered
    expect(screen.getByText('Billing features')).toBeInTheDocument();
    expect(screen.getByText('Support features')).toBeInTheDocument();

    // Check if feature descriptions are rendered
    expect(
      screen.getByText('Enable billing functionality'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enable support functionality'),
    ).toBeInTheDocument();
  });

  it('initializes form with correct values', () => {
    render(<FeaturesList />);

    // Get checkboxes
    const billingCheckbox = screen.getByTestId('billing.enabled');
    const supportCheckbox = screen.getByTestId('support.enabled');

    // Check initial values
    expect(billingCheckbox).toBeChecked();
    expect(supportCheckbox).not.toBeChecked();
  });

  it('handles successful form submission', async () => {
    const { showSuccess } = useNotify();

    render(<FeaturesList />);

    // Get checkboxes
    const billingCheckbox = screen.getByTestId('billing.enabled');
    const supportCheckbox = screen.getByTestId('support.enabled');

    // Toggle checkboxes
    await userEvent.click(billingCheckbox);
    await userEvent.click(supportCheckbox);

    // Verify new values
    expect(billingCheckbox).not.toBeChecked();
    expect(supportCheckbox).toBeChecked();

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify API call
    expect(post).toHaveBeenCalledWith('/feature-values/', {
      billing: {
        enabled: false,
      },
      support: {
        enabled: true,
      },
    });

    // Verify success notification
    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith('Features have been updated.');
    });
  });

  it('handles failed form submission', async () => {
    const { showErrorResponse } = useNotify();
    const error = new Error('API Error');
    vi.mocked(post).mockRejectedValueOnce(error as never);

    render(<FeaturesList />);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update features.',
      );
    });
  });

  it('disables submit button while submitting', async () => {
    vi.mocked(post).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<FeaturesList />);

    const submitButton = screen.getByRole('button', { name: /Save/i });

    // Click submit button
    await userEvent.click(submitButton);

    // Verify button is disabled during submission
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
