import { CalendarBlankIcon, XIcon } from '@phosphor-icons/react';
import Flatpickr from 'react-flatpickr';

import { translate } from '@waldur/i18n';
import { useFlatpickrTheme } from '@waldur/form/useFlatpickrTheme';

interface AuditDateRangeProps {
  after: string;
  before: string;
  onChange: (after: string, before: string) => void;
  onClear: () => void;
}

const fmtDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const AuditDateRange = ({ after, before, onChange, onClear }: AuditDateRangeProps) => {
  useFlatpickrTheme();

  const hasValue = !!(after || before);
  const value: string[] = [];
  if (after) value.push(after.slice(0, 10));
  if (before) value.push(before.slice(0, 10));

  return (
    <div style={{ position: 'relative' }}>
      <Flatpickr
        value={value.length ? value : undefined}
        className="form-control form-control-sm"
        placeholder={translate('Date range…')}
        options={{ mode: 'range', dateFormat: 'Y-m-d', monthSelectorType: 'static' }}
        onChange={(dates) => {
          if (dates.length === 2) {
            onChange(`${fmtDate(dates[0])}T00:00:00Z`, `${fmtDate(dates[1])}T23:59:59Z`);
          }
        }}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={onClear}
          className="btn btn-icon btn-sm p-0"
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <XIcon size={14} />
        </button>
      ) : (
        <CalendarBlankIcon
          size={14}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
};
