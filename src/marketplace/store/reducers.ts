import { combineReducers } from 'redux';

import { filterReducer } from '@waldur/marketplace/landing/filter/store/reducer';

export const reducer = combineReducers({
  filters: filterReducer,
});
