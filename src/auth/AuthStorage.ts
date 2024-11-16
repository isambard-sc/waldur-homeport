import { ENV } from '@waldur/configs/default';

const getStorage = (): Storage => {
  if (ENV.authStorage === 'localStorage') {
    return localStorage;
  } else if (ENV.authStorage === 'sessionStorage') {
    return sessionStorage;
  }
};

export const removeItem = (key: string): void => {
  getStorage().removeItem(key);
};

export const getItem = (key: string): string => {
  return getStorage().getItem(key);
};

export const setItem = (key: string, value: string) => {
  getStorage().setItem(key, value);
};
