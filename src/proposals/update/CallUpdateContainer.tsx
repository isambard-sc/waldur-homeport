import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { RoleEnum } from '@waldur/permissions/enums';
import { type RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { CallTabs } from '../details/CallTabs';
import { TeamSection } from '../team/TeamSection';
import { Call } from '../types';
import { checkIsCallManager, useCallBreadcrumbItems } from '../utils';

import { CallUpdateHero } from './CallUpdateHero';
import { CallConfiguration } from './configuration/CallConfiguration';
import { CallDocumentsSection } from './documents/CallDocumentsSection';
import { CallGeneralSection } from './general/CallGeneralSection';
import { CallOfferingsSection } from './offerings/CallOfferingsSection';
import { CallRoleMappingsList } from './role-mapping/CallRoleMappingsList';
import { CallRoundsList } from './rounds/CallRoundsList';

const PageHero = ({ call, refetch }) => (
  <div className="container-fluid my-5">
    <CallTabs call={call} />
    <CallUpdateHero call={call} refetch={refetch} />
  </div>
);

const Body = ({ call, refetch, loading }) => {
  // Check if user can manage the call (staff or call manager only)
  const canManageCall = useSelector((state: RootState) => {
    const user = getUser(state);
    if (!user) return false;
    // Staff users have full access
    if (user.is_staff) return true;
    // Call managers have full access
    if (checkIsCallManager(call, user)) return true;
    return false;
  });

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        // Only show management tabs to Call Managers and staff
        canManageCall && {
          key: 'rounds',
          title: (
            <>
              <ValidationIcon value={call.rounds.length > 0} />
              {translate('Rounds')}
            </>
          ),

          component: CallRoundsList,
        },
        canManageCall && {
          key: 'general',
          title: (
            <>
              <ValidationIcon value={call.description} />
              <span>{translate('General')}</span>
            </>
          ),

          component: CallGeneralSection,
        },
        canManageCall && {
          key: 'configuration',
          title: translate('Configuration'),
          component: CallConfiguration,
        },
        canManageCall && {
          key: 'documents',
          title: translate('Documents'),
          component: CallDocumentsSection,
        },
        canManageCall && {
          key: 'team',
          title: translate('Team'),
          defaultKey: !isFeatureVisible(MarketplaceFeatures.call_only)
            ? 'reviewers'
            : 'managers',
          children: [
            !isFeatureVisible(MarketplaceFeatures.call_only) && {
              key: 'reviewers',
              title: translate('Reviewers'),
              component: ({ call }) => (
                <TeamSection
                  scope={call}
                  roles={[RoleEnum.CALL_REVIEWER]}
                  roleTypes={['call', 'call_organizer']}
                  title={translate('Reviewers')}
                  hasTeamTabs
                />
              ),

              visible: false,
            },
            {
              key: 'managers',
              title: translate('Managers'),
              component: ({ call }) => (
                <TeamSection
                  scope={call}
                  roles={[RoleEnum.CALL_MANAGER]}
                  roleTypes={['call', 'call_organizer']}
                  title={translate('Managers')}
                  hasTeamTabs
                />
              ),

              visible: false,
            },
          ].filter(Boolean),
        },
        canManageCall && {
          key: 'offerings',
          title: translate('Offerings'),
          component: CallOfferingsSection,
        },
        canManageCall && {
          key: 'role_mapping',
          title: translate('Role mapping'),
          component: CallRoleMappingsList,
        },
      ].filter(Boolean) as PageBarTab[],
    [call, canManageCall],
  );

  usePageHero(<PageHero call={call} refetch={refetch} />);

  const breadcrumbItems = useCallBreadcrumbItems(call);
  useBreadcrumbs(breadcrumbItems);

  // If no tabs are available (e.g., user is only a reviewer), show access denied message
  if (tabs.length === 0) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">
          {translate(
            'You do not have permission to manage this call. Only call managers can access call management features.',
          )}
        </div>
      </div>
    );
  }

  const {
    tabSpec: { component: Component },
  } = usePageTabsTransmitter(tabs);

  return <Component call={call} refetch={refetch} loading={loading} />;
};

export const CallUpdateContainer: FunctionComponent = () => {
  const {
    params: { call_uuid },
  } = useCurrentStateAndParams();

  const {
    data: call,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['CallUpdateContainer', call_uuid],

    queryFn: () =>
      proposalProtectedCallsRetrieve({ path: { uuid: call_uuid } }).then(
        (r) => r.data as any as Call,
      ),

    refetchOnWindowFocus: false,
  });

  useTitle(call ? call.name : translate('Call update'));

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : call ? (
    <Body refetch={refetch} loading={isRefetching} call={call} />
  ) : (
    <InvalidRoutePage />
  );
};
