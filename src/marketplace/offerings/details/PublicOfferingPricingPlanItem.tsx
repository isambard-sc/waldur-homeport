import { FC } from 'react';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { Panel } from '@waldur/core/Panel';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanDetailsTable2 } from '@waldur/marketplace/details/plan/PlanDetailsTable2';

interface PricingPlanItemProps {
  offering: PublicOfferingDetails;
  plan: BasePublicPlan;
}

export const PublicOfferingPricingPlanItem: FC<PricingPlanItemProps> = ({
  offering,
  plan,
}) => {
  return (
    <Panel
      title={plan.name}
      titleClassName="fw-normal"
      actions={<PlanDescriptionButton planDescription={plan.description} />}
      cardBordered
    >
      <PlanDetailsTable2 offering={offering} plan={plan} />
    </Panel>
  );
};
