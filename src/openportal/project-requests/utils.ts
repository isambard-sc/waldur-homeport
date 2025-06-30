import { translate } from '@waldur/i18n';

import ProjectRequestState from './ProjectRequestState';

export const getProjectRequestStateOptions = () =>
  [
    { value: 'requested', label: translate('Requested') },
    { value: 'accepted', label: translate('Accepted') },
    { value: 'canceled', label: translate('Canceled') },
  ] as { value: ProjectRequestState; label: string }[];
