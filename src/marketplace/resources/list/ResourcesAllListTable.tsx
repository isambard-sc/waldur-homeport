import { FC } from 'react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ResourceImportButton } from '@waldur/marketplace/resources/import/ResourceImportButton';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { CreateResourceButton } from './CreateResourceButton';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ProjectResourcesAllFilter } from './ProjectResourcesAllFilter';
import { ResourceActionsButton } from './ResourceActionsButton';
import { getResourceAllListColumns } from './utils';

interface ResourcesAllListTableProps extends TableProps {
  hasProjectColumn?: boolean;
  hasCustomerColumn?: boolean;
  context?: 'organization' | 'project';
}

const AddResourceButton = ({
  context,
}: Pick<ResourcesAllListTableProps, 'context'>) => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  return (
    <CreateResourceButton
      organization={context ? customer : undefined}
      project={context === 'project' ? project : undefined}
    />
  );
};

export const ResourcesAllListTable: FC<ResourcesAllListTableProps> = (
  props,
) => {
  return (
    <Table
      {...props}
      filters={
        <ProjectResourcesAllFilter
          hasProjectFilter={props.hasProjectColumn}
          hasCustomerFilter={props.hasCustomerColumn}
        />
      }
      columns={getResourceAllListColumns(
        props.hasCustomerColumn,
        props.hasProjectColumn,
      )}
      hasOptionalColumns
      title={translate('Resources')}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      rowActions={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      hasQuery={true}
      enableExport
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
      tableActions={
        <>
          {isFeatureVisible(MarketplaceFeatures.import_resources) && (
            <ResourceImportButton />
          )}
          <AddResourceButton context={props.context} />
        </>
      }
    />
  );
};
