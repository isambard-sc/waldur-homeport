import { FunctionComponent } from 'react';

import { SharedProviderFilterContainer } from './SharedProviderFilter';
import { SharedProviderTabs } from './SharedProviderTabs';

export const SharedProviderContainer: FunctionComponent = () => {
  return (
    <>
      <SharedProviderFilterContainer />
      <SharedProviderTabs />
    </>
  );
};
