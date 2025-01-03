import { ArrowsClockwise } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import Illustration from '@waldur/images/table-placeholders/undraw_fixing_bugs_w7gi.svg';

import { translate } from './i18n';
import './LoadingScreen.css';
import { ThemeProvider } from './theme/ThemeProvider';

export const LoadingScreen: FunctionComponent<{
  loading: boolean;
  error?: Error;
}> = ({ loading, error }) => {
  return (
    <ThemeProvider>
      <div className="loading-screen-container">
        <div className="loading-screen">
          {loading ? (
            <h1 className="loading-title">{translate('Loading assets')}</h1>
          ) : null}
          {error ? (
            <>
              <div style={{ width: '100%' }}>
                <Illustration />
              </div>
              <div className="text-center">
                <h2>{translate('Unable to bootstrap application.')}</h2>
                <p>{(error as Error).message}</p>
                <Button onClick={() => location.reload()} variant="success">
                  <span className="svg-icon svg-icon-2">
                    <ArrowsClockwise />
                  </span>{' '}
                  {translate('Reload')}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
};
