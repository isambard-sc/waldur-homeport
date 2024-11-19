import { screen, render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { translate } from '@waldur/i18n';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import * as api from './api';
import { ResourceCreateUsageDialog } from './ResourceCreateUsageDialog';

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
});
