import { OpenStackVolume } from 'waldur-js-client';

export interface VolumeActionProps {
  resource: OpenStackVolume;
  refetch?;
}
