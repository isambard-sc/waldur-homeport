import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { vi, describe, it, expect } from 'vitest';

import { updatePlanPrices } from '@waldur/marketplace/common/api';

import { EditPlanPricesDialog } from './EditPlanPricesDialog';

// Mock dependencies
vi.mock('@waldur/marketplace/common/api', () => ({
  updatePlanPrices: vi.fn(),
}));

vi.mock('@waldur/modal/hooks', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
}));

const mockPlan = {
  uuid: 'plan-1',
  name: 'Basic Plan',
  prices: {
    cpu: 10,
    ram: 5,
  },
  future_prices: {},
  resources_count: 0,
};

const mockOffering = {
  components: [
    { type: 'cpu', name: 'CPU', measured_unit: 'cores' },
    { type: 'ram', name: 'RAM', measured_unit: 'GB' },
  ],
};

const renderComponent = () => {
  const store = createStore(
    combineReducers({
      form: formReducer,
    }),
  );

  return render(
    <Provider store={store}>
      <EditPlanPricesDialog
        resolve={
          {
            plan: mockPlan,
            offering: mockOffering,
            refetch: vi.fn(),
          } as any
        }
      />
    </Provider>,
  );
};

describe('EditPlanPricesDialog', () => {
  it('should successfully update prices', async () => {
    const mockUpdatePlanPrices = vi.mocked(updatePlanPrices);

    renderComponent();

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdatePlanPrices).toHaveBeenCalledWith('plan-1', {
        prices: {
          cpu: 10,
          ram: 5,
        },
      });
    });
  });

  it('should filter out prices for non-existent components', async () => {
    const originalPlan = mockPlan;
    mockPlan.prices = {
      cpu: 10,
      ram: 5,
      storage: 20, // Component that doesn't exist in offering
    } as any;

    renderComponent();

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updatePlanPrices).toHaveBeenCalledWith('plan-1', {
        prices: {
          cpu: 10,
          ram: 5,
          // storage price should be filtered out
        },
      });
    });

    // Restore original plan for other tests
    mockPlan.prices = originalPlan.prices;
  });
});
