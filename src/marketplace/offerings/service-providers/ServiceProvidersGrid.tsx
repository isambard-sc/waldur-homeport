import { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { SERVICE_PROVIDERS_GRID } from '@waldur/marketplace/offerings/service-providers/constants';
import Grid from '@waldur/marketplace/offerings/service-providers/shared/grid/Grid';
import { ServiceProviderDetailsCard } from '@waldur/marketplace/offerings/service-providers/shared/ServiceProviderDetailsCard';
import { connectTable, createFetcher } from '@waldur/table';
import { updatePageSize } from '@waldur/table/actions';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

const GridComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(updatePageSize(SERVICE_PROVIDERS_GRID, { label: '', value: 8 }));
  }, [dispatch]);
  return (
    <Grid
      {...props}
      verboseName={translate('Service providers')}
      hasQuery={true}
      queryPlaceholder={translate('Search by name or abbreviation')}
      gridItemComponent={ServiceProviderDetailsCard}
    />
  );
};

const GridOptions = {
  table: SERVICE_PROVIDERS_GRID,
  fetchData: createFetcher('marketplace-service-providers', ANONYMOUS_CONFIG),
  queryField: 'query',
};

export const ServiceProvidersGrid = connectTable(GridOptions)(GridComponent);
