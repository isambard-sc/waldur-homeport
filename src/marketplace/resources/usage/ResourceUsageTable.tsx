import { FunctionComponent, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { ComponentUserUsage, OfferingComponent } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { ComponentUsage } from './types';
import {
  getTotalUsagePeriod,
  getUsageTableData,
  getUserUsageTableData,
} from './utils';

interface ResourceUsageTableProps {
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
  userUsages?: ComponentUserUsage[];
}

interface TableData {
  username?: string;
  date: string;
  usage: number;
}

export const ResourceUsageTable: FunctionComponent<ResourceUsageTableProps> = ({
  offeringComponent,
  usages,
  userUsages,
}) => {
  const rows = useMemo<TableData[]>(() => {
    return userUsages?.length
      ? getUserUsageTableData(offeringComponent, userUsages)
      : getUsageTableData(offeringComponent, usages);
  }, [offeringComponent, usages, userUsages]);

  const total = useMemo(
    () =>
      Number(
        usages
          .filter((record) => record.type === offeringComponent.type)
          .reduce((acc, record) => acc + Number(record.usage), 0),
      ),
    [usages, offeringComponent],
  );

  const totalPeriod = useMemo(
    () => getTotalUsagePeriod(usages, offeringComponent),
    [offeringComponent, usages],
  );

  const hasUserStats = Boolean(userUsages?.length);

  return (
    <Table className="align-middle mt-4 mb-0">
      <thead>
        <tr className="bg-gray-50">
          {hasUserStats && <th>{translate('Username')}</th>}
          <th className="w-50">{translate('Date')}</th>
          <th>
            {offeringComponent.name + '/' + offeringComponent.measured_unit}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item, i) => (
          <tr key={i} className="border-top">
            {hasUserStats && <td>{item.username}</td>}
            <td>{item.date}</td>
            <td>{item.usage}</td>
          </tr>
        ))}
        <tr className="border-top">
          {hasUserStats ? (
            <>
              <th>{translate('Total')}</th>
              <td>{totalPeriod}</td>
            </>
          ) : (
            <th>
              {translate('Total')}
              {rows.length > 0 && (
                <small className="ms-1 text-muted fw-normal">
                  ({totalPeriod})
                </small>
              )}
            </th>
          )}
          <td>{total}</td>
        </tr>
      </tbody>
    </Table>
  );
};
