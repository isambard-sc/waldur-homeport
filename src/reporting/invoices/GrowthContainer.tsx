import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { GrowthChart } from './GrowthChart';
import { GrowthFilter } from './GrowthFilter';

export const GrowthContainer: FunctionComponent = () => {
  return (
    <Card className="card-bordered">
      <GrowthFilter />
      <GrowthChart />
    </Card>
  );
};
