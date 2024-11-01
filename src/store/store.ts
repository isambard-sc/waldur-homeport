import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';

import sagas from './effects';
import { staticReducers } from './reducers';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware, thunk];

const store: any = createStore(
  combineReducers(staticReducers),
  applyMiddleware(...middlewares),
);

const injectedReducers = {};
export const injectReducer = (key, reducer) => {
  injectedReducers[key] = reducer;
  store.replaceReducer(
    // @ts-ignore
    combineReducers({
      ...staticReducers,
      ...injectedReducers,
    }),
  );
};

const injectedSagas = new Set();
export const injectSaga = (key, saga) => {
  if (injectedSagas.has(key)) return;
  sagaMiddleware.run(saga);
  injectedSagas.add(key);
};

sagas.forEach((saga) => sagaMiddleware.run(saga));

export default store;
