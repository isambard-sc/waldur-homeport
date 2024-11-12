import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@waldur/modal/hooks';
import * as api from '@waldur/openstack/api';
import { VolumeType } from '@waldur/openstack/types';
import { Volume } from '@waldur/resource/types';
import { useNotify } from '@waldur/store/hooks';

import { RetypeDialog } from './RetypeDialog';

vi.mock('@waldur/openstack/api');
vi.mock('@waldur/store/hooks');
vi.mock('@waldur/modal/hooks');

const apiMock = vi.mocked(api);

const resource = {
  uuid: 'volume_uuid',
  tenant_uuid: 'tenant_uuid',
  type_name: 'Fast SSD',
  type: 'ssd',
} as unknown as Volume;

const fakeVolumeTypes = [
  {
    name: 'prod',
    description: 'HPC production HDD',
    url: 'prod',
  },
  {
    name: 'scratch',
    description: 'IOPS intensive SSD',
    url: 'scratch',
  },
  {
    name: 'Fast SSD',
    url: 'ssd',
  },
] as unknown as VolumeType[];

const renderDialog = () =>
  render(<RetypeDialog resolve={{ resource, refetch: vi.fn() }} />);

describe('RetypeDialog', () => {
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockCloseDialog = vi.fn();

  beforeEach(() => {
    apiMock.loadVolumeTypes.mockResolvedValue([]);
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
    } as any);
  });

  it('renders current volume type label', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
      expect(screen.getByText('Fast SSD')).toBeInTheDocument();
    });
  });

  it('renders placeholder if there are no other volume types available', async () => {
    renderDialog();
    await waitFor(() => {
      expect(
        screen.getByText('There are no other volume types available.'),
      ).toBeInTheDocument();
    });
  });

  it('renders list of volume types excluding current volume type', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await userEvent.click(select);

    await waitFor(() => {
      expect(screen.getByText('prod (HPC production HDD)')).toBeInTheDocument();
      expect(
        screen.getByText('scratch (IOPS intensive SSD)'),
      ).toBeInTheDocument();
      expect(within(select).queryByText('Fast SSD')).not.toBeInTheDocument();
    });
  });

  it('makes API request when form is submitted', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    apiMock.retypeVolume.mockResolvedValue(null);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('prod (HPC production HDD)'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(apiMock.retypeVolume).toHaveBeenCalledWith(resource.uuid, {
      type: 'prod',
    });
  });

  it('displays error message when API call fails', async () => {
    const error = new Error('Network error');
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    apiMock.retypeVolume.mockRejectedValue(error);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('prod (HPC production HDD)'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(mockShowErrorResponse).toHaveBeenCalledWith(
      error,
      'Unable to retype volume.',
    );
  });

  it('submit button is disabled when volume type is not selected', async () => {
    apiMock.loadVolumeTypes.mockResolvedValue(fakeVolumeTypes);
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current type:')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});
