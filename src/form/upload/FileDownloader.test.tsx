import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@waldur/core/api';
import * as store from '@waldur/store/hooks';

import { FileDownloader } from './FileDownloader';

vi.mock('@waldur/core/api');
vi.mock('@waldur/store/hooks');

describe('FileDownloader', () => {
  const mockUrl = 'http://example.com/file';
  const mockName = 'test.pdf';
  const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
  const mockShowError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock store hooks
    vi.mocked(store.useNotify).mockReturnValue({
      showErrorResponse: mockShowError,
    } as any);
  });

  it('renders download button with icon', () => {
    render(<FileDownloader url={mockUrl} name={mockName} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows loading spinner while downloading', () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockBlob } as any);

    render(<FileDownloader url={mockUrl} name={mockName} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error notification when download fails', async () => {
    const error = new Error('Download failed');
    vi.spyOn(api, 'get').mockRejectedValue(error);

    render(<FileDownloader url={mockUrl} name={mockName} />);

    await userEvent.click(screen.getByRole('button'));

    expect(mockShowError).toHaveBeenCalledWith(error, 'File download failed');
  });
});
