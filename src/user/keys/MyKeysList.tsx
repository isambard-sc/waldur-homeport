import { useUser } from '@waldur/workspace/hooks';

import { KeysList } from './KeysList';

export const MyKeysList = () => {
  const currentUser = useUser();
  return <KeysList user={currentUser} />;
};
