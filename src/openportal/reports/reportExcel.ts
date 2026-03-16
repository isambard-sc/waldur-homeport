/**
 * Multi-sheet Excel export for ProjectUsageReport and ProjectStorageReport.
 *
 * Uses the same JSZip-based XLSX approach as @waldur/table/exporters/excel,
 * extended to support multiple worksheets.
 *
 * Usage report sheets:
 *   "Daily totals"  — Date | Total usage (h) | Total jobs | Avg wait (min)
 *   "Usage by user" — Date | <user>... | Total (h)
 *   "Jobs by user"  — Date | <user>... | Total
 *   "Wait by user"  — Date | <user>... | Total avg (min)
 *   "Comp: <name>"  — one per component, Date | <user>... | Total (h)
 *
 * Storage report sheets:
 *   "Snapshot"      — Type | User | Volume | Usage | Limit | % Used
 *   "Daily totals"  — Date | <user>... | Total (GB)
 *   "Vol: <name>"   — one per volume, Date | Project (GB) | <user>... (GB)
 */

import JSZip from 'jszip';

import { SharedStrings, getSheetData } from '@waldur/table/exporters/excel';
import { saveFile } from '@waldur/table/exporters/saveFile';

import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { secondsToHours } from './storage';

const shortName = (s: string) => s.split('.')[0];

// ── XML escaping ─────────────────────────────────────────────────────────────

const esc = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Styles XML (same as the single-sheet exporter) ───────────────────────────

const STYLES_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="1">' +
  '<numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/>' +
  '</numFmts>' +
  '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellXfs count="4">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment wrapText="1"/></xf>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1" applyAlignment="1"><alignment wrapText="1"/></xf>' +
  '</cellXfs>' +
  '</styleSheet>';

// ── Sheet XML builder ─────────────────────────────────────────────────────────

interface SheetSpec {
  name: string;
  rows: any[][];
}

function buildSheetXml(ss: SharedStrings, rows: any[][]): string {
  const colCount = rows.length > 0 ? rows[0].length : 0;
  let cols = '<cols>';
  for (let i = 1; i <= colCount; i++) {
    // First column (date/label) slightly narrower; data columns wider
    const w = i === 1 ? 13 : 16;
    cols += `<col min="${i}" max="${i}" width="${w}" customWidth="1"/>`;
  }
  cols += '</cols>';

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    cols +
    '<sheetData>' +
    getSheetData(ss, rows) +
    '</sheetData>' +
    '</worksheet>'
  );
}

// ── Multi-sheet XLSX builder ──────────────────────────────────────────────────

async function downloadMultiSheetExcel(
  filename: string,
  sheets: SheetSpec[],
): Promise<void> {
  const zip = new JSZip();
  const ss = new SharedStrings();

  // [Content_Types].xml
  const overrides = sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ` +
        `ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />`,
    )
    .join('');
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="xml" ContentType="application/xml" />' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
      overrides +
      '</Types>',
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" ' +
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" ' +
      'Target="xl/workbook.xml"/>' +
      '</Relationships>',
  );

  // xl/workbook.xml
  const sheetEls = sheets
    .map(
      (s, i) =>
        `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
    )
    .join('');
  zip.file(
    'xl/workbook.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets>' +
      sheetEls +
      '</sheets>' +
      '</workbook>',
  );

  // xl/_rels/workbook.xml.rels
  const n = sheets.length;
  const sheetRels = sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" ` +
        `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" ` +
        `Target="worksheets/sheet${i + 1}.xml"/>`,
    )
    .join('');
  zip.file(
    'xl/_rels/workbook.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      sheetRels +
      `<Relationship Id="rId${n + 1}" ` +
      `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" ` +
      `Target="sharedStrings.xml"/>` +
      `<Relationship Id="rId${n + 2}" ` +
      `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" ` +
      `Target="styles.xml"/>` +
      '</Relationships>',
  );

  // worksheets
  sheets.forEach((sheet, i) => {
    zip.file(`xl/worksheets/sheet${i + 1}.xml`, buildSheetXml(ss, sheet.rows));
  });

  zip.file('xl/sharedStrings.xml', ss.serialize());
  zip.file('xl/styles.xml', STYLES_XML);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveFile(blob, filename);
}

// ── Usage report ─────────────────────────────────────────────────────────────

function buildUsageSheets(report: ProjectUsageReport): SheetSpec[] {
  const dates = report.dates;
  const users = report.localUsers();
  const displayNames = users.map(shortName);
  const components = report.componentNames();

  const round2 = (n: number) => +n.toFixed(2);

  // Sheet 1: Daily totals
  const dailyTotals: any[][] = [
    ['Date', 'Total usage (h)', 'Total jobs', 'Avg wait (min)'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      if (!daily) return [date, 0, 0, ''];
      const totalH = round2(secondsToHours(daily.totalUsage().seconds));
      const totalJobs = daily.numJobs;
      const avgWait =
        totalJobs > 0
          ? Math.round(daily.totalWaitSeconds / totalJobs / 60)
          : '';
      return [date, totalH, totalJobs, avgWait];
    }),
  ];

  // Sheet 2: Usage by user (hours)
  const usageByUser: any[][] = [
    ['Date', ...displayNames, 'Total (h)'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) =>
        round2(secondsToHours((daily?.usageForUser(u) ?? { seconds: 0 }).seconds)),
      );
      return [date, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
    }),
  ];

  // Sheet 3: Jobs by user
  const jobsByUser: any[][] = [
    ['Date', ...displayNames, 'Total'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) => daily?.userJobCounts[u] ?? 0);
      return [date, ...vals, vals.reduce((s, v) => s + v, 0)];
    }),
  ];

  // Sheet 4: Average wait by user (minutes)
  const waitByUser: any[][] = [
    ['Date', ...displayNames, 'Total avg (min)'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) => {
        if (!daily) return '';
        const jobs = daily.userJobCounts[u] ?? 0;
        return jobs > 0
          ? Math.round((daily.userWaitSeconds[u] ?? 0) / jobs / 60)
          : '';
      });
      const totalJobs = daily?.numJobs ?? 0;
      const avgAll =
        totalJobs > 0
          ? Math.round((daily?.totalWaitSeconds ?? 0) / totalJobs / 60)
          : '';
      return [date, ...vals, avgAll];
    }),
  ];

  const sheets: SheetSpec[] = [
    { name: 'Daily totals', rows: dailyTotals },
    { name: 'Usage by user', rows: usageByUser },
    { name: 'Jobs by user', rows: jobsByUser },
    { name: 'Wait by user', rows: waitByUser },
  ];

  // Component sheets
  for (const comp of components) {
    const compRows: any[][] = [
      ['Date', ...displayNames, 'Total (h)'],
      ...dates.map((date) => {
        const daily = report.getReport(date);
        const vals = users.map((u) =>
          round2(
            secondsToHours(
              (daily?.componentUsageForUser(comp, u) ?? { seconds: 0 }).seconds,
            ),
          ),
        );
        return [date, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];
    // Sheet names max 31 chars in Excel
    sheets.push({ name: `Comp: ${comp}`.slice(0, 31), rows: compRows });
  }

  return sheets;
}

export function downloadUsageExcel(
  report: ProjectUsageReport,
  title: string,
): void {
  const sheets = buildUsageSheets(report);
  downloadMultiSheetExcel(`${title}.xlsx`, sheets);
}

// ── Storage report ────────────────────────────────────────────────────────────

const GB = 1024 ** 3;
const toGB = (bytes: number) => +(bytes / GB).toFixed(3);

function buildStorageSheets(report: ProjectStorageReport): SheetSpec[] {
  const uids = report.userIdentifiers();
  const displayNames = uids.map((uid) => shortName(report.users[uid] ?? uid));
  const dates = report.dates;
  const volumes = report.volumes();

  // Sheet 1: Snapshot — current quota state per user/volume
  const snapshotRows: any[][] = [
    ['Type', 'User', 'Volume', 'Usage', 'Limit', '% Used'],
  ];
  for (const [vol, q] of Object.entries(report.projectQuotas)) {
    snapshotRows.push([
      'Project',
      '-',
      vol,
      q.usageFormatted,
      q.limitFormatted,
      +(q.usedFraction * 100).toFixed(1),
    ]);
  }
  for (const uid of uids) {
    const displayName = shortName(report.users[uid] ?? uid);
    for (const [vol, q] of Object.entries(report.quotaForUser(uid))) {
      snapshotRows.push([
        'User',
        displayName,
        vol,
        q.usageFormatted,
        q.limitFormatted,
        +(q.usedFraction * 100).toFixed(1),
      ]);
    }
  }

  // Sheet 2: Daily user totals (GB)
  const dailyTotals: any[][] = [
    ['Date', ...displayNames, 'Total (GB)'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      let totalBytes = 0;
      const vals = uids.map((uid) => {
        if (!daily) return 0;
        const bytes = Object.values(daily.userQuotas[uid] ?? {}).reduce(
          (s, q) => s + q.usageBytes,
          0,
        );
        totalBytes += bytes;
        return toGB(bytes);
      });
      return [date, ...vals, toGB(totalBytes)];
    }),
  ];

  const sheets: SheetSpec[] = [
    { name: 'Snapshot', rows: snapshotRows },
    { name: 'Daily user totals', rows: dailyTotals },
  ];

  // Per-volume sheets
  for (const vol of volumes) {
    const volRows: any[][] = [
      ['Date', 'Project (GB)', ...displayNames],
      ...dates.map((date) => {
        const daily = report.getReport(date);
        const projectGB = toGB(daily?.projectQuotas[vol]?.usageBytes ?? 0);
        const userVals = uids.map((uid) =>
          toGB(daily?.userQuotas[uid]?.[vol]?.usageBytes ?? 0),
        );
        return [date, projectGB, ...userVals];
      }),
    ];
    sheets.push({ name: `Vol: ${vol}`.slice(0, 31), rows: volRows });
  }

  return sheets;
}

export function downloadStorageExcel(
  report: ProjectStorageReport,
  title: string,
): void {
  const sheets = buildStorageSheets(report);
  downloadMultiSheetExcel(`${title}.xlsx`, sheets);
}

// ── JSON download ─────────────────────────────────────────────────────────────

export function downloadJson(items: object[], filename: string): void {
  const blob = new Blob([JSON.stringify(items, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
}
