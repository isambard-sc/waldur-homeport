import { reducer as notificationsReducer } from 'reapop';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { reducer as drawer } from '@waldur/drawer/reducer';
import { type IssueAttachmentState } from '@waldur/issues/attachments/types';
import { type IssueCommentState } from '@waldur/issues/comments/types';
import { reducer as marketplace } from '@waldur/marketplace/store/reducers';
import { reducer as modal } from '@waldur/modal/reducer';
import { reducer as theme } from '@waldur/navigation/theme/store';
import { reducer as title } from '@waldur/navigation/title';
import { type TableState } from '@waldur/table/types';
import { reducer as workspace } from '@waldur/workspace/reducers';

export const staticReducers = {
  form: formReducer,
  notifications: notificationsReducer(),
  modal,
  drawer,
  workspace,
  marketplace,
  title,
  theme,
};

const rootReducer = combineReducers(staticReducers);

export type RootState = ReturnType<typeof rootReducer> & {
  tables: Record<string, TableState>;
  issues: {
    attachments: IssueAttachmentState;
    comments: IssueCommentState;
  };
};
