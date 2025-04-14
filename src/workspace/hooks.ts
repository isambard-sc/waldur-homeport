import { useSelector } from 'react-redux';

import { getUser } from './selectors';

export const useUser = () => useSelector(getUser);
