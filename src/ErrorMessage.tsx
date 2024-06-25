import { FallbackRender } from '@sentry/react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import Illustration from '@waldur/images/table-placeholders/undraw_fixing_bugs_w7gi.svg';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

export const ErrorMessage: FallbackRender = (props) => (
  <>
    <ImageTablePlaceholder
      illustration={<Illustration />}
      title={translate('An error has occurred.')}
      description={props.error.message}
      action={
        <Button onClick={() => location.reload()} variant="success">
          <i className="fa fa-refresh" /> {translate('Reload')}
        </Button>
      }
    />
    <pre className="mt-3">{props.componentStack}</pre>
  </>
);
