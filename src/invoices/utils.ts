export const formatPeriod = ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => `${year}-${month < 10 ? '0' : ''}${month}`;
