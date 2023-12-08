import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';

const selectTableEntities = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].entities;
  }
  return {};
};

const selectTableEntitiesOrder = (state: RootState, table: string) => {
  if (state.tables && state.tables[table]) {
    return state.tables[table].order;
  }
  return [];
};

export const selectTableRows = createSelector(
  selectTableEntities,
  selectTableEntitiesOrder,
  (entities, order) => {
    const rows = [];

    order.forEach((uuid) => {
      rows.push(entities[uuid]);
    });
    return rows;
  },
);
