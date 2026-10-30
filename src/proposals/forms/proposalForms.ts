import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect, useRef } from 'react';
import {
  ProposalForm,
  ProposalFormFetchResult,
  proposalFormsFetch,
  proposalFormsRetrieve,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { ProposalFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

/**
 * Whether this site uses Formbricks forms on proposals at all.
 *
 * Gates everything about forms that a member of staff or a call manager sets
 * up: the Formbricks settings, the flows and each call's choice of flow.
 * Applicants and reviewers follow the backend instead, which reports whether
 * forms are available just now.
 */
export const isProposalFormsEnabled = (): boolean =>
  isFeatureVisible(ProposalFeatures.formbricks_forms);

export const PROPOSAL_FORM_QUERY_KEY = 'ProposalForm';

const proposalFormQueryKey = (proposalUuid: string) => [
  PROPOSAL_FORM_QUERY_KEY,
  proposalUuid,
];

const isBadRequest = (error: any) =>
  error?.status === 400 || error?.response?.status === 400;

/**
 * A proposal's extra forms: which are answered, which are still missing
 * before it can be submitted, and the answers given.
 *
 * Resolves to null for a proposal whose call has no form flow: the backend
 * answers that with a 400, which here means "no forms" rather than an error.
 * A proposal keeps its forms while Formbricks is switched off, so its stored
 * answers still show; `can_fill_in` is false then.
 *
 * Not fetched while the feature is off, so a site that does not use forms
 * makes no extra request for every proposal it shows.
 */
export const useProposalForm = (
  proposalUuid: string | undefined,
  enabled = true,
) =>
  useQuery<ProposalForm | null>({
    queryKey: proposalFormQueryKey(proposalUuid),
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
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });

/**
 * Asks the backend to bring the proposal's answers in from Formbricks, for
 * when a webhook has not delivered them (yet), and keeps the result as the
 * proposal's forms. Resolves to how many answers it brought in.
 */
export const fetchProposalForm = async (
  queryClient: QueryClient,
  proposalUuid: string,
): Promise<number> => {
  const { data } = await proposalFormsFetch({ path: { uuid: proposalUuid } });
  const { fetched, ...form }: ProposalFormFetchResult = data;
  queryClient.setQueryData<ProposalForm>(
    proposalFormQueryKey(proposalUuid),
    form,
  );
  return fetched;
};

/**
 * A Formbricks survey ends back on the proposal page with ?form_survey=<id>.
 * The answer may not have reached the backend yet, so it is fetched once,
 * and the parameter dropped so a reload does not fetch again.
 */
export const useFetchOnFormReturn = (proposalUuid: string | undefined) => {
  const { params } = useCurrentStateAndParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showErrorResponse } = useNotify();
  const handled = useRef(false);
  const formSurvey = params.form_survey;

  useEffect(() => {
    if (!formSurvey || !proposalUuid || handled.current) return;
    handled.current = true;
    router.stateService.go('.', { form_survey: null }, { location: 'replace' });
    if (!isProposalFormsEnabled()) return;
    fetchProposalForm(queryClient, proposalUuid).catch((error) =>
      showErrorResponse(error, translate('Unable to fetch your form answers.')),
    );
  }, [formSurvey, proposalUuid, router, queryClient, showErrorResponse]);
};
