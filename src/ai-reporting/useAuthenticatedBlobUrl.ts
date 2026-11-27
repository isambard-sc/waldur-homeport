import { useEffect, useState } from 'react';

import { get } from '@/core/api';

// Raster images only. A blob: URL runs in the portal's origin without the
// media endpoint's protective headers, so an SVG or HTML file opened from it
// (e.g. "Open image in new tab") could run script as the user.
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

// The media endpoint needs the Authorization header, which a plain
// <img src> can't send. This fetches an image and returns a blob: URL, or
// failed: true if it couldn't be fetched or isn't a safe image type.
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
        if (!IMAGE_TYPES.includes(blob.type)) {
          setFailed(true);
          return;
        }
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
