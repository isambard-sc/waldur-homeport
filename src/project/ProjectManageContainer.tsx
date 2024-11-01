import { UIView } from '@uirouter/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

const ProjectGeneral = lazyComponent(
  () => import('./manage/ProjectGeneral'),
  'ProjectGeneral',
);
const ProjectMetadata = lazyComponent(
  () => import('./manage/ProjectMetadata'),
  'ProjectMetadata',
);
const ProjectDelete = lazyComponent(
  () => import('./manage/ProjectDelete'),
  'ProjectDelete',
);

const tabs: PageBarTab[] = [
  {
    key: 'general',
    component: ProjectGeneral,
    title: translate('General'),
  },
  {
    key: 'metadata',
    component: ProjectMetadata,
    title: translate('Metadata'),
  },
  {
    key: 'remove',
    component: ProjectDelete,
    title: translate('Remove'),
  },
];

export const ProjectManageContainer = () => {
  const { tabSpec } = usePageTabsTransmitter(tabs);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component key={key} {...props} tabSpec={tabSpec} />
      )}
    />
  );
};
