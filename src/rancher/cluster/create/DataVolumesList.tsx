import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';

import { DataVolumeAddButton } from './DataVolumeAddButton';
import { DataVolumePanel } from './DataVolumePanel';

export const DataVolumesList: FunctionComponent<any> = (props) => (
  <Form.Group>
    <Col sm={{ span: props.sm, offset: props.smOffset }}>
      {props.fields.map((volume, index) => (
        <DataVolumePanel
          key={index}
          nodeIndex={props.nodeIndex}
          volumeIndex={index}
          volumePath={volume}
          onRemove={props.fields.remove}
          volumeTypes={props.volumeTypes}
          mountPoints={props.mountPoints}
        />
      ))}
      <DataVolumeAddButton
        onClick={() =>
          props.fields.push({
            size: 1,
            volume_type: props.defaultVolumeType,
          })
        }
      />
    </Col>
  </Form.Group>
);

DataVolumesList.defaultProps = {
  smOffset: 4,
  sm: 8,
};
