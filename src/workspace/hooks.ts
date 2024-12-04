import { useSelector } from 'react-redux';

import { getUser } from './selectors';

export const useUser = () => {
  const user = useSelector(getUser);
  return user;
};
