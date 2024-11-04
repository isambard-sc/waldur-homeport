import { titleCase } from '@waldur/core/utils';

import { getEventGroups } from './api';
import { EventGroupOption } from './types';

export const formatEventTitle = (choice) => {
  const map = {
    ssh: 'SSH',
    jira: 'JIRA',
    vms: 'Resources',
    customers: 'Organizations',
  };
  if (map[choice]) {
    choice = map[choice];
  } else {
    choice = titleCase(choice.replace('_', ' '));
  }
  return choice + ' events';
};

export const loadEventGroupsOptions: () => Promise<
  EventGroupOption[]
> = async () => {
  const groups = await getEventGroups();
  const options = Object.keys(groups)
    .map((key) => ({
      key,
      title: formatEventTitle(key),
      help_text: groups[key].join(', '),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return options;
};
