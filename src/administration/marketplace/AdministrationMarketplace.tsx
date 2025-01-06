import { useQuery } from '@tanstack/react-query';
import { Table } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { getDBSettings } from '../settings/api';
import { FieldRow } from '../settings/FieldRow';

const MARKETPLACE_SETTINGS = SettingsDescription.find(
  (group) => group.description === translate('Marketplace'),
);

export const AdministrationMarketplace = () => {
  const { data, error, isLoading, refetch } = useQuery(
    ['AdministrationMarketplace'],
    () => getDBSettings().then((response) => response.data),
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load marketplace configuration.')}
        loadData={refetch}
      />
    );
  if (!data) return null;

  return (
    <FormTable.Card
      title={MARKETPLACE_SETTINGS.description}
      className="card-bordered mb-5"
    >
      <Table bordered={true} responsive={true} className="form-table">
        {MARKETPLACE_SETTINGS.items.map((item) => (
          <FieldRow item={item} key={item.key} value={data[item.key]} />
        ))}
      </Table>
    </FormTable.Card>
  );
};
