import { concat, uniq } from 'lodash-es';
import {
  delay,
  call,
  put,
  select,
  take,
  race,
  cancelled,
  takeEvery,
} from 'redux-saga/effects';

import { takeLatestPerKey } from '@waldur/core/effects';
import { orderByFilter } from '@waldur/core/utils';
import { transformRows } from '@waldur/table/utils';

import * as actions from './actions';
import { getTableOptions } from './registry';
import { getTableState } from './selectors';
import { TableRequest } from './types';

function* fetchList(action) {
  const { table, extraFilter, pullInterval, force } = action.payload;
  const controller = new AbortController();
  try {
    const state = yield select(getTableState(table));
    const options = getTableOptions(table);

    let fields = [];
    if (extraFilter?.field || Object.keys(state.activeColumns).length) {
      const customFields = extraFilter?.field || ['uuid'];
      const activeFields = Object.values(state.activeColumns)
        .filter(Boolean)
        .flat();
      fields = uniq(concat(customFields, activeFields));
    }
    if (options.mandatoryFields) {
      fields = uniq(concat(fields, options.mandatoryFields));
    }

    const request: TableRequest = {
      currentPage: state.pagination.currentPage,
      pageSize: state.pagination.pageSize,
      filter: {
        ...extraFilter,
        field: fields,
      },
    };
    if (options.queryField && state.query !== '') {
      request.filter[options.queryField] = state.query;
    }
    if (state.sorting && state.sorting.field) {
      request.filter.o = orderByFilter(state.sorting);
    }
    request.options = { signal: controller.signal };
    if (options.staleTime && !force) {
      request.options.staleTime = options.staleTime;
    }

    // Debounce
    yield delay(100);
    const { rows, resultCount } = yield call(options.fetchData, request);
    const { entities, order } = transformRows(rows);
    if (options.onFetch) {
      options.onFetch(rows, resultCount, state.firstFetch);
    }
    yield put(actions.fetchListDone(table, entities, order, resultCount));
    if (state.sorting && state.sorting.loading) {
      yield put(actions.sortListDone(table));
    }
    if (pullInterval) {
      const { execute } = yield race({
        skip: take(
          (action) =>
            [actions.FETCH_LIST_START, actions.RESET_PAGINATION].includes(
              action.type,
            ) && action.payload.table === table,
        ),
        execute: delay(
          typeof pullInterval === 'function' ? pullInterval() : pullInterval,
        ),
      });
      if (execute) {
        yield put(
          actions.fetchListStart(table, extraFilter, options.pullInterval),
        );
      }
    }
  } catch (error) {
    yield put(actions.fetchListError(table, error));
  } finally {
    if (yield cancelled()) {
      controller.abort();
    }
  }
}

function* fireOnApplyFilters(action) {
  const { table, apply } = action.payload;
  const state = yield select(getTableState(table));
  const { onApplyFilter } = getTableOptions(table);
  if (apply && onApplyFilter) {
    onApplyFilter(state.filtersStorage);
  }
}

export default function* watchFetchList() {
  yield takeLatestPerKey(
    actions.FETCH_LIST_START,
    fetchList,
    ({ payload: { table } }) => table,
  );
  yield takeEvery(actions.APPLY_FILTERS, fireOnApplyFilters);
}
