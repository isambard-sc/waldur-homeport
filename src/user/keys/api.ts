import { deleteById, post } from '@waldur/core/api';

import { SshKey } from '../types';

export const removeKey = (id: string) => deleteById('/keys/', id);
export const createKey = (data) => post<SshKey>('/keys/', data);
