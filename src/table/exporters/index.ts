const exporters = {
  csv: () => import('./csv'),
  clipboard: () => import('./clipboard'),
  pdf: () => import('./pdf'),
  excel: () => import('./excel'),
};

export default async function exportAs(format, table, data) {
  const exporter = await exporters[format]();
  await exporter.default(table, data);
}
