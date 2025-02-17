import { describe, it, expect } from 'vitest';

import { type RootState } from '@waldur/store/reducers';
import { selectTableRows } from '@waldur/table/selectors';

describe('SelectTableRows', () => {
  it('should return rows composed from entities by order', () => {
    const table = 'userList';
    const rows = [
      {
        userName: 'Daniel',
        email: 'daniel@gmail.com',
      },
      {
        userName: 'Alice',
        email: 'alice@gmail.com',
      },
    ];
    const state = {
      tables: {
        [table]: {
          entities: {
            1: {
              userName: 'Daniel',
              email: 'daniel@gmail.com',
            },
            2: {
              userName: 'Alice',
              email: 'alice@gmail.com',
            },
          },
          order: [1, 2],
        },
      },
    } as unknown as RootState;
    expect(selectTableRows(state, table)).toEqual(rows);
  });
});
