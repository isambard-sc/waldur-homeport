import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const IMPERSONATED_KEY = 'waldur/workspace/impersonated';

export const setImpersonatedUserUuid = (userUuid: string) => {
  setItem(IMPERSONATED_KEY, userUuid);
};

export const getImpersonatedUserUuid = (): string => getItem(IMPERSONATED_KEY);

export const clearImpersonatedUserUuid = () => removeItem(IMPERSONATED_KEY);
