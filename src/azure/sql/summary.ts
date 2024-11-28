import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const AzureSQLDatabaseSummary = lazyComponent(() =>
  import('./AzureSQLDatabaseSummary').then((module) => ({
    default: module.AzureSQLDatabaseSummary,
  })),
);
const AzureSQLServerSummary = lazyComponent(() =>
  import('./AzureSQLServerSummary').then((module) => ({
    default: module.AzureSQLServerSummary,
  })),
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
