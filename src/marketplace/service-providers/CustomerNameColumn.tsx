export const CustomerNameColumn = ({ row }) => (
  <>
    <>{row.name}</>
    {row.abbreviation && row.abbreviation !== row.name ? (
      <p className="text-muted">{row.abbreviation.toLocaleUpperCase()}</p>
    ) : null}
  </>
);
