export type ExportFormat = 'clipboard' | 'pdf' | 'excel' | 'csv';

export interface ExportConfig {
  format: ExportFormat;
  withFilters?: boolean;
  allPages?: boolean;
}

export interface ExportData {
  fields: (string | number)[];
  data: (string | number | boolean)[][];
  /** Optional column widths in Excel character units. Array index corresponds to column index. */
  columnWidths?: number[];
}
