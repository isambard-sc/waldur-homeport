import {
  screen,
  render,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { translate } from '@waldur/i18n';
import { submitUsageReport } from '@waldur/marketplace/common/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import * as api from './api';
import { ResourceCreateUsageDialog } from './ResourceCreateUsageDialog';

vi.mock('@waldur/marketplace/common/api', () => ({
  submitUsageReport: vi.fn(),
}));

const loader = vi.spyOn(api, 'getProviderUsageComponents');

const props = {
  resolve: {
    resource_name: 'Test resource',
    resource_uuid: 'test-uuid',
    offering_uuid: 'test-offering-uuid',
    customer_name: 'Test customer',
    project_name: 'Test project',
  },
};

const mockData = {
  components: [
    {
      uuid: 'comp-1',
      name: 'Component 1',
      type: 'comp1',
      measured_unit: 'GB',
      description: 'Test component',
    },
  ],
  periods: [
    {
      label: 'January 2024',
      value: { uuid: 'period-1', components: [] },
    },
  ],
};

const renderDialog = (props) => {
  const store = createActionStore();
  render(
    <Provider store={store}>
      <ResourceCreateUsageDialog {...props} />
    </Provider>,
  );
};

describe('ResourceCreateUsageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when data is being fetched', () => {
    loader.mockImplementation(() => new Promise(() => {}));
    renderDialog(props);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    loader.mockRejectedValue('error');
    await act(() => {
      renderDialog(props);
    });
    expect(
      screen.getByText('Unable to load offering details.'),
    ).toBeInTheDocument();
  });

  it('renders message when there are no components', async () => {
    loader.mockResolvedValue({ components: [], periods: [] });
    await act(() => {
      renderDialog(props);
    });
    expect(
      screen.getByText('Offering does not have any usage-based components.'),
    ).toBeInTheDocument();
  });

  it('displays dialog title with resource name', async () => {
    loader.mockResolvedValue({ components: [], periods: [] });
    await act(() => {
      renderDialog(props);
    });
    expect(
      screen.getByText(`${translate('Resource usage')} "Test resource"`),
    ).toBeInTheDocument();
  });

  it('displays client organization name', async () => {
    loader.mockResolvedValue(mockData);
    await act(() => {
      renderDialog(props);
    });
    expect(screen.getByText('Client organization')).toBeInTheDocument();
    expect(
      screen.getByText('Test customer', { exact: false }),
    ).toBeInTheDocument();
  });

  it('submits form with usage values', async () => {
    loader.mockResolvedValue(mockData);
    const submitSpy = vi.mocked(submitUsageReport);
    submitSpy.mockResolvedValue({});

    await act(() => {
      renderDialog(props);
    });

    const amountInput = screen.getByPlaceholderText('Amount *');
    const descInput = screen.getByPlaceholderText('Enter a description...');
    const submitBtn = screen.getByText('Submit usage report');

    fireEvent.change(amountInput, { target: { value: '10' } });
    fireEvent.change(descInput, { target: { value: 'Test usage' } });

    await act(() => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({
        plan_period: 'period-1',
        usages: [
          {
            type: 'comp1',
            amount: '10',
            description: 'Test usage',
          },
        ],
      });
    });
  });
});
