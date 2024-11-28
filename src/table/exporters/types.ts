export type ExportFormat = 'clipboard' | 'pdf' | 'excel' | 'csv';

export interface ExportConfig {
  format: ExportFormat;
  withFilters?: boolean;
  allPages?: boolean;
}
