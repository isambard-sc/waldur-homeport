import { useEffect, useState } from 'react';

import { get } from '@/core/api';

// The media endpoint needs the Authorization header, which a plain
// <img src> can't send. This fetches the file and returns a blob: URL, or
// failed: true if it couldn't be fetched.
export const useAuthenticatedBlobUrl = (
  url: string,
): { objectUrl: string | null; failed: boolean } => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;
    setFailed(false);

    get<Blob>(url)
      .then((blob) => {
        if (cancelled) return;
        created = window.URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (created) window.URL.revokeObjectURL(created);
    };
  }, [url]);

  return { objectUrl, failed };
};
