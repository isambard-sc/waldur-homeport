import { useState, useEffect } from 'react';

import { get } from '@waldur/core/api';
import { Image } from '@waldur/core/Image';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

export const ImageFetcher = ({ url, name, thumb = false }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await get<Blob>(url, { responseType: 'blob' });

        // Convert blob to a URL and set it to state
        const imageBlob = new Blob([response.data]);
        const imageUrl = URL.createObjectURL(imageBlob);

        setImageUrl(imageUrl);
      } catch {
        setError(translate('Failed to load image'));
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  return (
    <div
      className={!thumb && imageUrl ? 'text-center bg-dark-always' : undefined}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>{error}</p>
      ) : imageUrl ? (
        thumb ? (
          <Image size={40} src={imageUrl} />
        ) : (
          <img
            src={imageUrl}
            alt={name}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )
      ) : (
        translate('Failed to load image')
      )}
    </div>
  );
};
