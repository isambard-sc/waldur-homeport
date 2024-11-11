import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { Limits } from '@waldur/marketplace/common/types';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ResourceComponentItem } from './ResourceComponentItem';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: { current_usages: Limits; limits: Limits; limit_usage: Limits };
  components: OfferingComponent[];
}) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });

  return (
    <>
      <Row>
        {components.slice(0, 4).map((component) => (
          <Col
            key={component.type}
            xs={isSmallScreen ? 12 : 6}
            sm={6}
            md={12}
            xl={6}
          >
            <ResourceComponentItem resource={resource} component={component} />
          </Col>
        ))}
      </Row>
      {components?.length > 4 && (
        <div className="flex-grow-1 d-flex align-items-end mt-5">
          <ResourceShowMoreComponents
            resource={resource}
            components={components}
          />
        </div>
      )}
    </>
  );
};
