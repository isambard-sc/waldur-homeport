import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { AuditDateRange } from '../AuditDateRange';

export const MANAGED_AUDIT_EVENT_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'note_added', label: 'Note added' },
  { value: 'details_updated', label: 'Details updated' },
  { value: 'project_attached', label: 'Project attached' },
  { value: 'project_detached', label: 'Project detached' },
];

const DateRangeField = ({ input }: { input: any }) => (
  <AuditDateRange
    after={input.value?.after ?? ''}
    before={input.value?.before ?? ''}
    onChange={(after, before) => input.onChange({ after, before })}
    onClear={() => input.onChange(null)}
  />
);

const PureManagedProjectAuditFilter = () => (
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
            options={MANAGED_AUDIT_EVENT_OPTIONS}
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

export const ManagedProjectAuditFilter = reduxForm({
  form: 'ManagedProjectAuditLogFilter',
  destroyOnUnmount: false,
})(PureManagedProjectAuditFilter as any) as any;
