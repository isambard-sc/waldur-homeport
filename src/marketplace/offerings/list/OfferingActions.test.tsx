import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { translate } from '@waldur/i18n';

import { OfferingActions } from './OfferingActions';

vi.mock('@waldur/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

vi.mock('@uirouter/react', () => ({
  useRouter: vi.fn(),
  useCurrentStateAndParams: () => ({
    state: {
      data: {
        workspace: 'admin',
      },
    },
  }),
}));

const renderOfferingActions = (props?) => {
  const store = createStore(() => ({
    workspace: {
      user: {
        uuid: 'user_uuid',
      },
    },
  }));
  return render(
    <Provider store={store}>
      <OfferingActions
        row={{
          uuid: 'offering_uuid',
          customer_uuid: 'customer_uuid',
          state: 'Active',
          resources_count: 0,
        }}
        refetch={() => {}}
        {...props}
      />
    </Provider>,
  );
};

describe('OfferingActions', () => {
  it('renders actions dropdown button', () => {
    renderOfferingActions();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows all available actions when dropdown is clicked', async () => {
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    await act(() => {
      fireEvent.click(dropdownButton);
    });

    expect(screen.getByText(translate('Edit'))).toBeInTheDocument();
    expect(
      screen.getByText(translate('Preview order form')),
    ).toBeInTheDocument();
    expect(screen.getByText(translate('Open public page'))).toBeInTheDocument();
  });

  it('hides delete action when offering is not in Draft state', () => {
    renderOfferingActions();
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);

    expect(screen.queryByText(translate('Delete'))).not.toBeInTheDocument();
  });

  it('shows delete action for Draft offerings', async () => {
    renderOfferingActions({
      row: {
        uuid: 'offering_uuid',
        customer_uuid: 'customer_uuid',
        state: 'Draft',
        resources_count: 0,
      },
    });

    const dropdownButton = screen.getByRole('button');
    await act(() => {
      fireEvent.click(dropdownButton);
    });

    expect(screen.getByText(translate('Delete'))).toBeInTheDocument();
  });
});
