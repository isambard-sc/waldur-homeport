const key = 'waldur/cookies/consent';

export const setConsent = (value: string) => localStorage.setItem(key, value);

export const getConsent = () => localStorage.getItem(key);
