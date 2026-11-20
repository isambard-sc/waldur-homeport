import { QueryClient, useQuery } from '@tanstack/react-query';
import {
  ProjectForm,
  ProjectFormFetchResult,
  projectFormsFetch,
  projectFormsRetrieve,
} from 'waldur-js-client';

import { isProposalFormsEnabled } from './proposalForms';

export const PROJECT_FORM_QUERY_KEY = 'ProjectForm';

const projectFormQueryKey = (projectUuid: string) => [
  PROJECT_FORM_QUERY_KEY,
  projectUuid,
];

/** A 400 says the project has no end-of-project forms; a 404 that the
 * viewer may not see them. Either way there is nothing to show. */
const isNone = (error: any) =>
  [400, 404].includes(error?.status ?? error?.response?.status);

/**
 * A project's end-of-project forms: from its call's closing flow, or the
 * site's for projects without one (existing awards). Null when it has none.
 */
export const useProjectForm = (
  projectUuid: string | undefined,
  enabled = true,
) =>
  useQuery<ProjectForm | null>({
    queryKey: projectFormQueryKey(projectUuid),
    queryFn: () =>
      projectFormsRetrieve({ path: { uuid: projectUuid } })
        .then((response) => response.data)
        .catch((error) => {
          if (isNone(error)) {
            return null;
          }
          throw error;
        }),
    enabled: enabled && Boolean(projectUuid) && isProposalFormsEnabled(),
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });

/** Brings the project's answers in from Formbricks and keeps the result. */
export const fetchProjectForm = async (
  queryClient: QueryClient,
  projectUuid: string,
): Promise<number> => {
  const { data } = await projectFormsFetch({ path: { uuid: projectUuid } });
  const { fetched, ...form }: ProjectFormFetchResult = data;
  queryClient.setQueryData<ProjectForm>(projectFormQueryKey(projectUuid), form);
  return fetched;
};
