import { runSaga } from 'redux-saga';
import { vi } from 'vitest';

import * as api from './api';
import * as effects from './effects';

export const setupFixture = (state = {}) => {
  const mockUpdateProject = vi.spyOn(api, 'updateProjectPartially');
  vi.spyOn(api, 'dangerouslyUpdateProject').mockReturnValue(null);
  const updateProject = (action) =>
    runSaga(store, effects.handleUpdateProject, action).toPromise();
  const hasActionWithType = (type) =>
    dispatched.find((a) => a.type === type) !== undefined;

  const dispatched = [];
  const store = {
    dispatch: (a) => dispatched.push(a),
    getState: () => state,
  };

  return {
    dispatched,
    hasActionWithType,
    mockUpdateProject,
    updateProject,
  };
};
