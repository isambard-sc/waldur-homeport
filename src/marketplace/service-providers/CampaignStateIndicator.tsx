import { StateIndicator } from '@waldur/core/StateIndicator';

const LABEL_CLASSES = {
  draft: 'info',
  active: 'success',
  terminated: 'default',
};

export const CampaignStateIndicator = ({ row }) => (
  <StateIndicator
    label={row.state}
    variant={LABEL_CLASSES[row.state] || 'info'}
    active={row.state === 'pending'}
    outline
    pill
  />
);
