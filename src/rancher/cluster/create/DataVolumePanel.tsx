import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { FormName, FormSection } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { RancherFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { RemoveButton } from '@waldur/marketplace/offerings/RemoveButton';

import { VolumeMountPointGroup } from './VolumeMountPointGroup';
import { VolumeSizeGroup } from './VolumeSizeGroup';
import { VolumeTypeGroup } from './VolumeTypeGroup';

interface OwnProps {
  volumeIndex: number;
  volumePath: string;
  nodeIndex: number;
  onRemove(index: number): void;
  volumeTypes: any[];
  mountPoints: any[];
}

export const DataVolumePanel: FunctionComponent<OwnProps> = (props) => (
  <Card>
    <Card.Header>
      <RemoveButton onClick={() => props.onRemove(props.volumeIndex)} />
      <h4>
        {translate('Data volume #{index}', { index: props.volumeIndex + 1 })}
      </h4>
    </Card.Header>
    <Card.Body>
      <FormSection name={props.volumePath}>
        {isFeatureVisible(RancherFeatures.volume_mount_point) && (
          <FormName>
            {({ form }) => (
              <VolumeMountPointGroup
                form={form}
                nodeIndex={props.nodeIndex}
                volumeIndex={props.volumeIndex}
                mountPoints={props.mountPoints}
              />
            )}
          </FormName>
        )}
        <VolumeSizeGroup
          nodeIndex={props.nodeIndex}
          volumeIndex={props.volumeIndex}
        />
        <VolumeTypeGroup volumeTypes={props.volumeTypes} />
      </FormSection>
    </Card.Body>
  </Card>
);
