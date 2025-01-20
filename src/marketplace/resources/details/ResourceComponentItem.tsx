import { getBillingTypeLabel } from '../usage/utils';

import { QuotaCell } from './QuotaCell';

const normalize = (value: number, factor: number) =>
  ((value || 0) / (factor || 1)).toFixed();

export const ResourceComponentItem = ({ component, resource }) => {
  return (
    <QuotaCell
      usage={
        component.billing_type === 'limit' && resource.limit_usage
          ? normalize(resource.limit_usage[component.type], component.factor)
          : normalize(resource.current_usages[component.type], component.factor)
      }
      limit={
        component.billing_type === 'usage' || component.billing_type === 'limit'
          ? normalize(resource.limits[component.type], component.factor)
          : null
      }
      title={component.name}
      description={getBillingTypeLabel(component.billing_type)}
    />
  );
};
