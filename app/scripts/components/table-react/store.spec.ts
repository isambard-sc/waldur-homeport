import { initialState } from '@waldur/table-react/store.fixture';

import * as actions from './actions';
import { reducer, getTableState } from './store';

describe('Table reducer', () => {
  it('should return default state', () => {
    const state = { tables: {} };
    expect(getTableState('users')(state)).toEqual({
      loading: false,
      error: null,
      pagination: {
        pageSize: 10,
        resultCount: 0,
        currentPage: 1,
      },
      entities: {},
      order: [],
    });
  });

  it('should handle start action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_START,
      payload: {
        table: 'users',
      },
    });
    expect(state.users.loading).toBe(true);
  });

  it('should handle done action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_DONE,
      payload: {
        table: 'users',
        resultCount: 1,
      },
    });
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBe(null);
    expect(state.users.pagination.resultCount).toBe(1);
  });

  it('should handle error action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_ERROR,
      payload: {
        table: 'users',
        error: 'Unable to fetch data.',
      },
    });
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBe('Unable to fetch data.');
  });

  it('should handle goto page action', () => {
    const state = reducer({}, {
      type: actions.FETCH_LIST_GOTO_PAGE,
      payload: {
        table: 'users',
        page: 3,
      },
    });
    expect(state.users.pagination.currentPage).toBe(3);
  });

  it('should handle entity create action', () => {
    const prevState = reducer({},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          entities: initialState.entities,
          order: initialState.order,
          resultCount: 2,
        },
      });
    const state = reducer(prevState,
    {
      type: actions.ENTITY_CREATE,
      payload: {
        table: 'users',
        uuid: '52ff72e159d7472fb35d4db517e6c16k',
        content: {
          uuid: '52ff72e159d7472fb35d4db517e6c16k',
          full_name: 'John Brown',
          email: 'john@gmail.com',
        },
      },
    });
    expect(state.users.entities).toEqual({
      '10ff42e159d7472fb35d4db517e6c16e': {
        uuid: '10ff42e159d7472fb35d4db517e6c16e',
        full_name: 'Dereck Benon',
        email: 'dereck@gmail.com',
      },
      '412ff42e159g7472fb3524db517e65165': {
        uuid: '412ff42e159g7472fb3524db517e65165',
        full_name: 'Alice Grown',
        email: 'alice@gmail.com',
      },
      '52ff72e159d7472fb35d4db517e6c16k': {
        uuid: '52ff72e159d7472fb35d4db517e6c16k',
        full_name: 'John Brown',
        email: 'john@gmail.com',
      },
    });
    expect(state.users.order).toEqual([
      '10ff42e159d7472fb35d4db517e6c16e',
      '412ff42e159g7472fb3524db517e65165',
      '52ff72e159d7472fb35d4db517e6c16k',
    ]);
  });

  it('should handle entity update action', () => {
    const prevState = reducer({},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          entities: initialState.entities,
          order: initialState.order,
          resultCount: 2,
        },
      });
    const state = reducer(prevState,
      {
        type: actions.ENTITY_UPDATE,
        payload: {
          table: 'users',
          uuid: '10ff42e159d7472fb35d4db517e6c16e',
          content: {
            uuid: '10ff42e159d7472fb35d4db517e6c16e',
            full_name: 'Derek',
            email: 'derek@gmail.com',
          },
        },
      });
    expect(state.users.entities).toEqual({
      '10ff42e159d7472fb35d4db517e6c16e': {
        uuid: '10ff42e159d7472fb35d4db517e6c16e',
        full_name: 'Derek',
        email: 'derek@gmail.com',
      },
      '412ff42e159g7472fb3524db517e65165': {
        uuid: '412ff42e159g7472fb3524db517e65165',
        full_name: 'Alice Grown',
        email: 'alice@gmail.com',
      },
    });
    expect(state.users.order).toEqual(['10ff42e159d7472fb35d4db517e6c16e', '412ff42e159g7472fb3524db517e65165']);
  });

  it('should handle entity delete action', () => {
    const prevState = reducer({},
      {
        type: actions.FETCH_LIST_DONE,
        payload: {
          table: 'users',
          entities: initialState.entities,
          order: initialState.order,
          resultCount: 2,
        },
      });
    const state = reducer(prevState,
      {
        type: actions.ENTITY_DELETE,
        payload: {
          table: 'users',
          uuid: '10ff42e159d7472fb35d4db517e6c16e',
        },
      });
    expect(state.users.entities).toEqual({
      '412ff42e159g7472fb3524db517e65165': {
        uuid: '412ff42e159g7472fb3524db517e65165',
        full_name: 'Alice Grown',
        email: 'alice@gmail.com',
      },
    });
    expect(state.users.order).toEqual(['412ff42e159g7472fb3524db517e65165']);
  });

});
