import { FC } from 'react';
import { Table } from 'react-bootstrap';

import FormTable from '@waldur/form/FormTable';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { FieldRow } from './FieldRow';

interface SettingsCardProps {
  groupNames: string[];
  settingsSource?: any;
}

export const SettingsCard: FC<SettingsCardProps> = ({
  groupNames,
  settingsSource,
}) => {
  return (
    <>
      {SettingsDescription.filter((group) =>
        groupNames.includes(group.description),
      ).map((group) => (
        <FormTable.Card
          title={group.description}
          key={group.description}
          className="card-bordered mb-5"
        >
          <Table bordered={true} responsive={true} className="form-table">
            {group.items.map((item) => (
              <FieldRow
                item={item}
                key={item.key}
                value={settingsSource?.[item.key]}
              />
            ))}
          </Table>
        </FormTable.Card>
      ))}
    </>
  );
};
