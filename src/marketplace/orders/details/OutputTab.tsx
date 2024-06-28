import { Card } from 'react-bootstrap';

import { CodeBlockPreview } from '@waldur/core/CodeBlockPreview';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

export const OutputTab = ({ order }) => {
  return (
    <Card>
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Output')}</h3>
        </Card.Title>
      </Card.Header>
      {order.output ? (
        <Card.Body>
          <CodeBlockPreview code={order.output} />
        </Card.Body>
      ) : (
        <NoResult message={translate('No outputs found for this order')} />
      )}
    </Card>
  );
};
