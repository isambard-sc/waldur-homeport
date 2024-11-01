import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';

import sagas from './effects';
import { staticReducers } from './reducers';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}

const composeEnhancers =
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25,
    })) ||
  compose;

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware, thunk];
let enhancedMiddlewares;

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  middlewares.push(require('redux-logger').default);
  enhancedMiddlewares = composeEnhancers(applyMiddleware(...middlewares));
} else {
  enhancedMiddlewares = applyMiddleware(...middlewares);
}

const store: any = createStore(
  combineReducers(staticReducers),
  enhancedMiddlewares,
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
