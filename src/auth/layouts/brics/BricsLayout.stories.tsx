import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AdminAnnouncement } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { AuthStoryHarness } from '../../storyFixtures';

import { BricsLayout } from './BricsLayout';

const notice = (
  uuid: string,
  type: AdminAnnouncement['type'],
  description: string,
): AdminAnnouncement =>
  ({
    uuid,
    type,
    description,
    active_from: '2026-10-20T08:00:00Z',
    active_to: '2026-10-27T18:00:00Z',
    is_active: true,
  }) as AdminAnnouncement;

const NOTICES = [
  notice(
    'n1',
    'danger',
    'Isambard-AI phase 2 login nodes are unavailable while we investigate a storage fault. Running jobs are not affected.',
  ),
  notice(
    'n2',
    'warning',
    'Planned maintenance on Tuesday 28 October, 09:00–13:00. Jupyter notebooks will be unavailable during this window.',
  ),
  notice(
    'n3',
    'information',
    'New: [project usage reports](https://docs.example.org) are now available from the project dashboard.',
  ),
];

/**
 * Sets the deployment's settings and query data for the story. The harness
 * owns the query client, so the data is seeded from inside it.
 */
const BricsStory = ({
  notices,
  children,
}: {
  notices: AdminAnnouncement[];
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();
  Object.assign(ENV.plugins.WALDUR_CORE, {
    SHORT_PAGE_TITLE: 'BriCS',
    SITE_DESCRIPTION: 'Bristol Centre for Supercomputing',
    HERO_LINK_URL: 'https://docs.example.org',
    HERO_LINK_LABEL: 'How to get started on BriCS services',
    DOCS_URL: 'https://docs.example.org',
    SUPPORT_PORTAL_URL: 'https://support.example.org',
    SITE_EMAIL: 'support@example.ac.uk',
    POWERED_BY_LOGO: '',
    // Keycloak is the only way in.
    AUTHENTICATION_METHODS: [],
  });
  queryClient.setQueryData(
    ['IdentityProvidersConfigurations'],
    [{ provider: 'keycloak', label: 'Keycloak' }],
  );
  queryClient.setQueryData(['LoginNotices'], notices);
  return <>{children}</>;
};

const meta: Meta = {
  title: 'Auth/Layouts/BriCS',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "This deployment's own login page: the digital brain behind a navy wash, a frosted login card with a single login button, links from the existing settings and the current admin announcements.",
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthStoryHarness>
        <Story />
      </AuthStoryHarness>
    ),
  ],
};

export default meta;

export const WithNotices: StoryObj = {
  render: () => (
    <BricsStory notices={NOTICES}>
      <BricsLayout />
    </BricsStory>
  ),
};

export const Quiet: StoryObj = {
  render: () => (
    <BricsStory notices={[]}>
      <BricsLayout />
    </BricsStory>
  ),
};
