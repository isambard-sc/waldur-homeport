import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

const VARIANT_MAP = {
  pending: 'warning',
  active: 'success',
  stale: 'warning',
  error: 'danger',
  deleted: 'secondary',
} as const;

const LABEL_MAP: Record<string, () => string> = {
  pending: () => translate('Pending'),
  active: () => translate('Active'),
  stale: () => translate('Stale'),
  error: () => translate('Error'),
  deleted: () => translate('Deleted'),
};

export const RemoteProjectStateField = ({ state }: { state: string }) => (
  <StateIndicator
    label={LABEL_MAP[state]?.() ?? state}
    variant={VARIANT_MAP[state] ?? 'secondary'}
    light
    pill
  />
);
