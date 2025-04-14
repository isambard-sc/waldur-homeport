import { Resource } from 'waldur-js-client';

export const PublicResourcesLimits = ({ row }: { row: Resource }) => {
  if (!row.limits || !Object.keys(row.limits).length) return 'N/A';
  const keyValues = Object.entries(row.limits).map((entry) => entry.join(': '));
  return (
    <div className="text-nowrap">
      {keyValues.map((keyValue, index) => (
        <span key={index} className="d-block">
          {keyValue}
        </span>
      ))}
    </div>
  );
};
