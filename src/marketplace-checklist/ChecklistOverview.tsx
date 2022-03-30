import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import Select from 'react-select';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { ChecklistSelectorOption } from '@waldur/marketplace-checklist/types';
import { useTitle } from '@waldur/navigation/title';

import { CustomerMap } from './CustomerMap';
import { StatsTable } from './StatsTable';
import { useChecklistOverview } from './useChecklist';

export const ChecklistOverview: FunctionComponent = () => {
  useTitle(translate('Compliance'));
  const {
    params: { category },
  } = useCurrentStateAndParams();
  const state = useChecklistOverview(category);

  if (state.checklistLoading) {
    return <LoadingSpinner />;
  } else if (state.checklistErred) {
    return <>{translate('Unable to load checklists.')}</>;
  } else if (state.checklistOptions) {
    if (!state.checklist) {
      return <>{translate('There are no checklist yet.')}</>;
    }
    return (
      <>
        <Select
          getOptionValue={({ uuid }: ChecklistSelectorOption) => uuid}
          getOptionLabel={({ name }: ChecklistSelectorOption) => name}
          value={state.checklist}
          onChange={state.setChecklist}
          options={state.checklistOptions}
          isClearable={false}
          {...reactSelectMenuPortaling()}
        />
        {state.statsLoading ? (
          <LoadingSpinner />
        ) : state.statsErred ? (
          <>{translate('Unable to load compliance overview.')}</>
        ) : (
          <Card className="m-t-md">
            <CustomerMap customers={state.statsList} />
            <StatsTable
              stats={state.statsList}
              scopeTitle={translate('Organization')}
            />
          </Card>
        )}
      </>
    );
  } else {
    return null;
  }
};
