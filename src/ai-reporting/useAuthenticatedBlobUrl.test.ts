import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/core/api';

import { useAuthenticatedBlobUrl } from './useAuthenticatedBlobUrl';

vi.mock('@/core/api');

describe('useAuthenticatedBlobUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('shows a real PNG', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(
      new Blob(['x'], { type: 'image/png' }) as any,
    );
    const { result } = renderHook(() => useAuthenticatedBlobUrl('/f/'));
    await waitFor(() => expect(result.current.objectUrl).toBe('blob:fake'));
  });

  it.each(['image/svg+xml', 'text/html', 'application/octet-stream', ''])(
    'never shows "%s" inline, since opening it could run script in the portal',
    async (type) => {
      vi.spyOn(api, 'get').mockResolvedValue(new Blob(['x'], { type }) as any);
      const { result } = renderHook(() => useAuthenticatedBlobUrl('/f/'));
      await waitFor(() => expect(result.current.failed).toBe(true));
      expect(result.current.objectUrl).toBeNull();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    },
  );
});
