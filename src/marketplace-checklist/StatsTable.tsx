import { Table } from 'react-bootstrap';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

import { ChecklistStats } from './types';

const getVariant = (score: number) =>
  score < 25 ? 'danger' : score < 75 ? 'warning' : 'primary';

export const StatsTable = ({
  stats,
  scopeTitle,
}: {
  stats: ChecklistStats[];
  scopeTitle: string;
}) => (
  <Table responsive={true} bordered={true} striped={true} className="mt-3">
    <thead>
      <tr>
        <th className="col-sm-1">#</th>
        <th>{scopeTitle}</th>
        <th>{translate('Score')}</th>
      </tr>
    </thead>
    <tbody>
      {stats.map((customer, index) => (
        <tr key={customer.uuid}>
          <td>{index + 1}</td>
          <td>{customer.name}</td>
          <td>
            <StateIndicator
              label={`${customer.score} %`}
              variant={getVariant(customer.score)}
              outline
              pill
              data-testid="state-indicator"
              data-variant={getVariant(customer.score)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
