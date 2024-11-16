const key = 'waldur/auth/redirect';

export const setRedirect = (value) =>
  localStorage.setItem(key, JSON.stringify(value));

export const resetRedirect = () => localStorage.removeItem(key);

export const getRedirect = () => {
  const value = localStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      return;
    }
  }
};
