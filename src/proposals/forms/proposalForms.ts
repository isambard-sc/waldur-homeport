import { useQuery } from '@tanstack/react-query';
import { ProposalForm, proposalFormsRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { ProposalFeatures } from '@/FeaturesEnums';

/**
 * Whether this site takes applications through Formbricks form flows at all.
 *
 * Gates everything about form flows that a member of staff or a call manager
 * sets up: the Formbricks settings, the flows and each call's choice of flow.
 * Applicants and reviewers follow the backend instead, which offers a call's
 * flow only while the feature and the Formbricks connection are both on.
 */
export const isProposalFormsEnabled = (): boolean =>
  isFeatureVisible(ProposalFeatures.formbricks_forms);

export const PROPOSAL_FORM_QUERY_KEY = 'ProposalForm';

const isBadRequest = (error: any) =>
  error?.status === 400 || error?.response?.status === 400;

/**
 * A proposal's progress through its call's form flow, and the answers given.
 *
 * Resolves to null for a proposal whose call has no form flow: the backend
 * answers that with a 400, which here means "not a form proposal" rather
 * than an error. A proposal keeps its form while Formbricks is switched off,
 * so its stored answers still show; only next_step is withheld then.
 *
 * Not fetched while the feature is off, so a site that does not use form
 * flows makes no extra request for every proposal it shows.
 */
export const useProposalForm = (
  proposalUuid: string | undefined,
  enabled = true,
) =>
  useQuery<ProposalForm | null>({
    queryKey: [PROPOSAL_FORM_QUERY_KEY, proposalUuid],
    queryFn: () =>
      proposalFormsRetrieve({ path: { uuid: proposalUuid } })
        .then((response) => response.data)
        .catch((error) => {
          if (isBadRequest(error)) {
            return null;
          }
          throw error;
        }),
    enabled: enabled && Boolean(proposalUuid) && isProposalFormsEnabled(),
    // The answers arrive from Formbricks while the applicant is on another
    // tab, filling in a survey: look again when they come back.
    refetchOnWindowFocus: true,
    meta: { skipGlobalErrorRedirect: true },
  });
