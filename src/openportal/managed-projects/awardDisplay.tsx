import { Link as AwardLinkData, ProjectTemplate } from 'waldur-js-client';

import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

/** The offering an award is for: the last part of its destination. */
export const offeringName = (destination?: string | null): string | null => {
  if (!destination) {
    return null;
  }
  const parts = destination.split('.');
  return parts[parts.length - 1];
};

/**
 * What a member's role on the awarding portal becomes in this one.
 *
 * Read from role_mapping_data, which carries the local role itself; the raw
 * role_mapping holds only the local role's name, so its values have no
 * description to show. Matched case-insensitively, as the backend does.
 */
export const memberRoleLabel = (
  role: string | null | undefined,
  template: Pick<ProjectTemplate, 'role_mapping_data'> | null | undefined,
): string => {
  if (!role) {
    return translate('No role assigned');
  }
  const mapping = template?.role_mapping_data;
  if (!mapping || Object.keys(mapping).length === 0) {
    return translate('Will not be added to project');
  }
  const mapped =
    mapping[role] ??
    Object.entries(mapping).find(
      ([key]) => key.toLowerCase() === role.toLowerCase(),
    )?.[1];
  if (!mapped) {
    return translate('{role} has no mapping - will not be added to project', {
      role,
    });
  }
  return (
    mapped.description || mapped.name || mapped.uuid || translate('Not set')
  );
};

/**
 * allowed_domains as the award states it: null means any domain may join,
 * an empty list means none may.
 */
export const allowedDomainsLabel = (
  domains: string[] | null | undefined,
): string => {
  if (domains === null || domains === undefined) {
    return translate('All domains allowed');
  }
  if (domains.length === 0) {
    return translate('No domains allowed');
  }
  return domains.join(', ');
};

/** A link from the award details, as a link where it has a URL. */
export const AwardLink = ({ link }: { link?: AwardLinkData | null }) => {
  const label = link?.id || link?.url;
  if (link?.url) {
    return <ExternalLink url={link.url} label={label} />;
  }
  return <>{renderFieldOrDash(label)}</>;
};
