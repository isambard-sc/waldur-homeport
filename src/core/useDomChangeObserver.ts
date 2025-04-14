import { useEffect } from 'react';

export const useDOMChangeObserver = (callback, deps: any[] = []) => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      callback(document.documentElement.scrollHeight);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [callback, ...deps]);
};
