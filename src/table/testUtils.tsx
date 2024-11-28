import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { TableState } from '@waldur/table/types';

const fakeInstance = { uuid: 'test-uuid', state: 'OK' };

export const renderTable = (Component, tableId, rowId, row) => {
  const mockStore = configureStore();
  const state: TableState = {
    loading: false,
    entities: {
      [rowId]: row,
    },
    order: [rowId],
    pagination: {
      pageSize: 10,
      resultCount: 1,
      currentPage: 1,
    },
    toggled: {},
    activeColumns: {},
    columnPositions: [],
  };
  const store = mockStore({
    tables: {
      [tableId]: state,
    },
    workspace: {
      user: {},
    },
    title: {
      title: '',
      subtitle: '',
    },
  });
  return render(
    <Provider store={store}>
      <Component resourceScope={fakeInstance} />
    </Provider>,
  );
};
