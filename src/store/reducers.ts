import { reducer as notificationsReducer } from 'reapop';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { reducer as bookings } from '@waldur/booking/store/reducer';
import { reducer as drawer } from '@waldur/drawer/reducer';
import { reducer as issues } from '@waldur/issues/reducers';
import { reducer as marketplace } from '@waldur/marketplace/store/reducers';
import { reducer as modal } from '@waldur/modal/reducer';
import { reducer as theme } from '@waldur/navigation/theme/store';
import { reducer as title } from '@waldur/navigation/title';
import { reducer as tables } from '@waldur/table/store';
import { reducer as workspace } from '@waldur/workspace/reducers';

import { reducer as config } from './config';

export const rootReducer = combineReducers({
  form: formReducer,
  notifications: notificationsReducer(),
  config,
  modal,
  drawer,
  tables,
  issues,
  workspace,
  marketplace,
  bookings,
  title,
  theme,
});

export type RootState = ReturnType<typeof rootReducer>;
