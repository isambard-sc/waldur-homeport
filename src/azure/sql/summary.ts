import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const AzureSQLDatabaseSummary = lazyComponent(
  () => import('./AzureSQLDatabaseSummary'),
  'AzureSQLDatabaseSummary',
);
const AzureSQLServerSummary = lazyComponent(
  () => import('./AzureSQLServerSummary'),
  'AzureSQLServerSummary',
);

export const AzureSQLServerSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'Azure.SQLServer',
    component: AzureSQLServerSummary,
  };

export const AzureSQLDatabaseSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'Azure.SQLDatabase',
    component: AzureSQLDatabaseSummary,
  };
