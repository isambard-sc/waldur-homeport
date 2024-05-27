import { render } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { TableState } from '@waldur/table/types';

const fakeInstance = { state: 'OK' };

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
      <Component resource={fakeInstance} />
    </Provider>,
  );
};
