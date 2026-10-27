import { useEffect, useState } from 'react';

import { get } from '@/core/api';

// Same reason FileDownloader exists: the media endpoint is token-authenticated,
// so a plain <img src> (which can't carry the Authorization header) 404s. This
// fetches the file through the app's own authenticated client and hands back
// a local blob: URL an <img> can actually load.
export const useAuthenticatedBlobUrl = (url: string): string | null => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;

    get<Blob>(url).then((blob) => {
      if (cancelled) return;
      created = window.URL.createObjectURL(blob);
      setObjectUrl(created);
    });

    return () => {
      cancelled = true;
      if (created) window.URL.revokeObjectURL(created);
    };
  }, [url]);

  return objectUrl;
};
