import { FunctionComponent } from 'react';
import { FieldArray } from 'redux-form';

import { ENV } from '@waldur/configs/default';

import { DataVolumesList } from './DataVolumesList';
import { SystemVolumeSizeGroup } from './SystemVolumeSizeGroup';
import { SystemVolumeTypeGroup } from './SystemVolumeTypeGroup';

export const NodeStorageGroup: FunctionComponent<any> = (props) => (
  <>
    <SystemVolumeSizeGroup />
    <SystemVolumeTypeGroup volumeTypes={props.volumeTypes} />
    {props.mountPoints.length > 0 &&
      !ENV.plugins.WALDUR_RANCHER.DISABLE_DATA_VOLUME_CREATION && (
        <FieldArray
          name="data_volumes"
          component={DataVolumesList}
          nodeIndex={props.nodeIndex}
          mountPoints={props.mountPoints}
          volumeTypes={props.volumeTypes}
          defaultVolumeType={props.defaultVolumeType}
          sm={props.sm}
        />
      )}
  </>
);
