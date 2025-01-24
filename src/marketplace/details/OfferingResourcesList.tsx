import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  FILTER_OFFERING_RESOURCE,
  TABLE_OFFERING_RESOURCE,
} from '@waldur/marketplace/details/constants';
import { Offering } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { NON_TERMINATED_STATES } from '../resources/list/constants';
import { ProviderResourceActions } from '../resources/list/ProviderResourceActions';
import {
  getResourceAllListColumns,
  resourcesListRequiredFields,
} from '../resources/list/utils';

import { OfferingResourcesFilter } from './OfferingResourcesFilter';

interface OwnProps {
  offering: Offering;
}

export const OfferingResourcesList: FunctionComponent<OwnProps> = (
  ownProps,
) => {
  const filterValues: any = useSelector(
    getFormValues(FILTER_OFFERING_RESOURCE),
  );
  const filter = useMemo(() => {
    const filter: Record<string, string | string[]> = {};
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
      if (filterValues?.include_terminated) {
        filter.state = [...filter.state, 'Terminated'];
      }
    } else {
      if (!filterValues?.include_terminated) {
        filter.state = NON_TERMINATED_STATES;
      }
    }
    return {
      offering_uuid: ownProps.offering.uuid,
      ...filter,
    };
  }, [ownProps.offering, filterValues]);

  const tableProps = useTable({
    table: TABLE_OFFERING_RESOURCE,
    fetchData: createFetcher('marketplace-provider-resources'),
    filter,
    queryField: 'query',
    mandatoryFields: resourcesListRequiredFields(false),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Resources')}
      columns={getResourceAllListColumns(true, true)}
      hasOptionalColumns
      verboseName={translate('offering resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hasQuery={true}
      showPageSizeSelector={true}
      rowActions={({ row }) => (
        <ProviderResourceActions resource={row} refetch={tableProps.fetch} />
      )}
      filters={<OfferingResourcesFilter />}
    />
  );
};
