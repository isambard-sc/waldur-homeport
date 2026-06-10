import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { AuditDateRange } from '../AuditDateRange';

export const REMOTE_AUDIT_EVENT_OPTIONS = [
  { value: 'award_attempted', label: 'Award attempted' },
  { value: 'award_rejected', label: 'Award rejected' },
  { value: 'award_created', label: 'Award created' },
  { value: 'award_updated', label: 'Award updated' },
  { value: 'award_update_confirmed', label: 'Award update confirmed' },
  { value: 'award_update_rejected', label: 'Award update rejected' },
  { value: 'state_changed', label: 'State changed' },
  { value: 'resource_deleted', label: 'Resource deleted' },
];

const DateRangeField = ({ input }: { input: any }) => (
  <AuditDateRange
    after={input.value?.after ?? ''}
    before={input.value?.before ?? ''}
    onChange={(after, before) => input.onChange({ after, before })}
    onClear={() => input.onChange(null)}
  />
);

const PureRemoteProjectAuditFilter = () => (
  <>
    <TableFilterItem
      title={translate('Event type')}
      name="event_type"
      badgeValue={(v) => v?.label}
    >
      <Field
        name="event_type"
        component={({ input }) => (
          <Select
            placeholder={translate('All events')}
            options={REMOTE_AUDIT_EVENT_OPTIONS}
            value={input.value || null}
            onChange={input.onChange}
            isClearable
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Date range')}
      name="date_range"
      badgeValue={(v) =>
        v?.after ? `${v.after.slice(0, 10)} – ${v.before.slice(0, 10)}` : null
      }
    >
      <Field name="date_range" component={DateRangeField} />
    </TableFilterItem>
  </>
);

export const RemoteProjectAuditFilter = reduxForm({
  form: 'RemoteProjectAuditLogFilter',
  destroyOnUnmount: false,
})(PureRemoteProjectAuditFilter as any) as any;
