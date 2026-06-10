import { FC, ReactNode } from 'react';

import { translate } from '@waldur/i18n';

export const parseDetails = (value: any): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (typeof value === 'object') return value;
  return {};
};

const sortedStringify = (value: unknown): string => {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(sortedStringify).join(',')}]`;
  if (typeof value === 'object') {
    const sorted = Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${sortedStringify((value as any)[k])}`);
    return `{${sorted.join(',')}}`;
  }
  return JSON.stringify(value);
};

export const renderValue = (v: unknown): ReactNode => {
  if (v === null || v === undefined) return <span className="text-muted">—</span>;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v !== 'object') return String(v);
  return (
    <pre className="mb-0 fs-8" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(v, null, 2)}
    </pre>
  );
};

interface DetailsDiffProps {
  before: any;
  after: any;
  beforeLabel?: string;
  afterLabel?: string;
  afterNote?: ReactNode;
}

export const DetailsDiff: FC<DetailsDiffProps> = ({
  before,
  after,
  beforeLabel,
  afterLabel,
  afterNote,
}) => {
  const beforeObj = parseDetails(before);
  const afterObj = parseDetails(after);
  const hasBoth = Object.keys(beforeObj).length > 0 && Object.keys(afterObj).length > 0;
  const keys = Array.from(
    new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]),
  ).sort();

  if (keys.length === 0) return <span className="text-muted">—</span>;

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-sm mb-0 fs-8">
        <thead className="table-light">
          <tr>
            <th style={{ width: '20%' }}>{translate('Field')}</th>
            <th style={{ width: '40%' }}>{beforeLabel ?? translate('Before')}</th>
            <th style={{ width: '40%' }}>
              {afterLabel ?? translate('After')}
              {afterNote && <span className="ms-1">{afterNote}</span>}
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const beforeVal = beforeObj[key];
            const afterVal = afterObj[key];
            const differs =
              hasBoth && sortedStringify(beforeVal) !== sortedStringify(afterVal);
            return (
              <tr key={key} className={differs ? 'table-warning' : undefined}>
                <td className="fw-semibold align-top">{key}</td>
                <td className="align-top">{renderValue(beforeVal)}</td>
                <td className="align-top">{renderValue(afterVal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
