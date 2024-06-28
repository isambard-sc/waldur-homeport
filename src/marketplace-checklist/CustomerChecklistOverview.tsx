import { useState, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  getChecklists,
  getCustomerStats,
  getCategories,
  countChecklists,
} from './api';
import { StatsTable } from './StatsTable';
import { Checklist } from './types';

const loadData = async () => {
  const checklistCount = await countChecklists();
  if (checklistCount === 0) {
    return { categories: [], checklists: [] };
  }

  const categories = await getCategories();
  const checklists = await getChecklists();
  return {
    categories,
    checklists: checklists.reduce(
      (result, checklist) => ({
        ...result,
        [checklist.category_uuid]: [
          ...(result[checklist.category_uuid] || []),
          checklist,
        ],
      }),
      {},
    ),
  };
};

const CategoryPanel = ({ category, checklists, customer }) => {
  const [checklist, setChecklist] = useState<Checklist>();
  const statsState = useAsync(
    () =>
      checklist
        ? getCustomerStats(customer.uuid, checklist.uuid)
        : Promise.resolve([]),
    [customer, checklist],
  );

  return (
    <Panel title={category.name} className="mb-6">
      <Select
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        value={checklist}
        onChange={(value: Checklist) => setChecklist(value)}
        options={checklists}
        isClearable={false}
      />
      {statsState.loading ? (
        <LoadingSpinner />
      ) : Array.isArray(statsState.value) && statsState.value.length > 0 ? (
        <StatsTable
          stats={statsState.value}
          scopeTitle={translate('Project')}
        />
      ) : checklist ? (
        translate('There are no matching checklists.')
      ) : null}
    </Panel>
  );
};

export const CustomerChecklistOverview: FunctionComponent = () => {
  const asyncState = useAsync(loadData, []);
  const customer = useSelector(getCustomer);

  if (asyncState.loading) {
    return <LoadingSpinner />;
  }

  if (
    asyncState.error ||
    !asyncState.value?.categories?.length ||
    !Object.keys(asyncState.value.checklists).length
  ) {
    return null;
  }
  return (
    <>
      {asyncState.value.categories.map((category) => (
        <CategoryPanel
          key={category.uuid}
          checklists={asyncState.value.checklists[category.uuid]}
          category={category}
          customer={customer}
        />
      ))}
    </>
  );
};
