import { Card } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';

export const CallDocumentsCard = ({ call }) => {
  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Documents')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <ul>
          {call.documents.map((document, i) => (
            <li key={i}>
              <ExternalLink
                url={document.file}
                label={decodeURIComponent(
                  document.file_name
                    .split('/')
                    .pop()
                    .replace(/_[^_]+\./, '.'),
                )}
                iconless
              />
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
};
