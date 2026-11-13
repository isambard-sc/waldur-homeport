import { useEffect, useState } from 'react';

import { get } from '@/core/api';

// The media endpoint needs the Authorization header, which a plain
// <img src> can't send. This fetches the file and returns a blob: URL.
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
