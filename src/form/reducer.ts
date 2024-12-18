import { reducer as formReducer } from 'redux-form';

import { ALL_RESOURCES_TABLE_ID } from '@waldur/marketplace/resources/list/constants';

const initialFormState = {
  // We need this to be created first because we use this for sidebar resource filters
  [ALL_RESOURCES_TABLE_ID]: null,
};

export const reducer = (state = initialFormState, action) => {
  const formState = formReducer(state, action);
  return {
    ...state,
    ...formState,
  };
};
