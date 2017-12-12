import { call, put, fork, takeEvery } from 'redux-saga/effects';

import actions from './actions';
import api from './api';

function* fetchDashboardChart(chartId, scope) {
  try {
    const charts = yield call(api.fetchChart, chartId, scope);
    yield put(actions.dashboardChartSuccess(chartId, charts));
  } catch (error) {
    yield put(actions.dashboardChartError(chartId, error));
  }
}

function* watchEmit() {
  yield takeEvery<any>(actions.EMIT_SIGNAL, action => api.emitSignal(action.signal));
}

function* rootSaga(): any {
  yield takeEvery<any>(actions.DASHBOARD_CHARTS_START, ({chartId, scope}) => fetchDashboardChart(chartId, scope));
  yield fork(watchEmit);
}

export default rootSaga;
