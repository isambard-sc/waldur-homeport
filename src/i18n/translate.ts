import { setMessageTransform } from 'waldur-i18n-runtime';

import { ENV } from '@/core/config';

import { DOMAIN_MESSAGES, DOMAIN_SLOTS, DomainSlot } from './domainMessages';

export {
  formatJsx,
  formatJsxTemplate,
  formatTemplate,
  translate,
} from 'waldur-i18n-runtime';

setMessageTransform((message) => {
  const domain = ENV.plugins?.WALDUR_CORE.TRANSLATION_DOMAIN;
  if (!domain || !DOMAIN_MESSAGES[domain]) {
    return message;
  }
  return DOMAIN_MESSAGES[domain][message] || message;
});

/**
 * The deployment's own wording for a slot, or `fallback` (already
 * translated) where it has none.
 */
export const domainText = (slot: DomainSlot, fallback: string): string => {
  const domain = ENV.plugins?.WALDUR_CORE.TRANSLATION_DOMAIN;
  return (domain && DOMAIN_SLOTS[domain]?.[slot]) || fallback;
};
