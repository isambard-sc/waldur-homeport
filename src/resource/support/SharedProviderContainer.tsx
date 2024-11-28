import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabs } from './SharedProviderTabs';

export const SharedProviderContainer: FunctionComponent = () => {
  return (
    <Card className="card-bordered">
      <SharedProviderFilterContainer />
      <SharedProviderTabs />
    </Card>
  );
};
