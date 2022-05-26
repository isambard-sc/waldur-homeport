import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useTitle } from '@waldur/navigation/title';

import { VmOverviewFilterContainer } from './VmOverviewFilterContainer';
import { VmTypeOverview } from './VmTypeOverview';

export const VmTypeOverviewContainer: FunctionComponent = () => {
  useTitle(translate('VM type overview'));
  useReportingBreadcrumbs();
  return (
    <>
      <VmOverviewFilterContainer />
      <VmTypeOverview />
    </>
  );
};
