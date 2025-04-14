import { translate } from '@waldur/i18n';

export const AnnouncementTypeOptions = [
  {
    label: translate('Information'),
    value: 'information',
  },
  {
    label: translate('Warning'),
    value: 'warning',
  },
  {
    label: translate('Danger'),
    value: 'danger',
  },
];

export const IssueTemplateTypeOptions = [
  {
    label: translate('Informational'),
    value: 'INFORMATIONAL',
  },
  {
    label: translate('Service request'),
    value: 'SERVICE_REQUEST',
  },
  {
    label: translate('Change request'),
    value: 'CHANGE_REQUEST',
  },
  {
    label: translate('Incident'),
    value: 'INCIDENT',
  },
];
