/**
 * Multi-sheet Excel export for ProjectUsageReport and ProjectStorageReport.
 *
 * Uses the same JSZip-based XLSX approach as @waldur/table/exporters/excel,
 * extended to support multiple worksheets.
 *
 * Usage report sheets:
 *   "Daily totals"        — Date | Total usage (h) | Total jobs | Avg wait (min)
 *   "Monthly totals"      — Month | Total usage (h) | Total jobs | Avg wait (min)
 *   "Usage by user"       — Date | <user>... | Total (h)
 *   "Jobs by user"        — Date | <user>... | Total
 *   "Wait by user"        — Date | <user>... | Total avg (min)
 *   "Comp <name>"         — one per component, Date | <user>... | Total (h)
 *   "Usage by project"    — Month | <project>... | Total (h)  [multi-project only]
 *   "Jobs by project"     — Month | <project>... | Total      [multi-project only]
 *   "Wait by project"     — Month | <project>... | Total avg  [multi-project only]
 *
 * Storage report sheets:
 *   "Snapshot"            — Type | User | Volume | Usage | Limit | % Used
 *   "Daily user totals"   — Date | <user>... | Total (GB)
 *   "Monthly user totals" — Month | <user>... | Total (GB)
 *   "Vol <name>"          — one per volume, Date | Project (GB) | <user>... (GB)
 */

import JSZip from 'jszip';

import { SharedStrings, getSheetData } from '@waldur/table/exporters/excel';
import { saveFile } from '@waldur/table/exporters/saveFile';

import { ProjectAccountingSummary } from 'waldur-js-client';

import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { secondsToHours } from './storage';

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

function buildUsageSheets(reports: ProjectUsageReport[]): SheetSpec[] {
  // Combine all reports for the per-day/per-user sheets
  const report =
    reports.length === 1 ? reports[0] : ProjectUsageReport.combine(reports);

  const dates = report.dates;
  const users = report.localUsers(); // full local_username e.g. "chris.aiproject"
  const components = report.componentNames();

  const round2 = (n: number) => +n.toFixed(2);

  // ── Sheet 1: Daily totals ─────────────────────────────────────────────────
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

  // ── Sheet 2: Monthly totals ───────────────────────────────────────────────
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  const monthlyTotals: any[][] = [
    ['Month', 'Total usage (h)', 'Total jobs', 'Avg wait (min)'],
    ...months.map((month) => {
      const monthDates = dates.filter((d) => d.startsWith(month));
      let totalSec = 0;
      let totalJobs = 0;
      let totalWaitSec = 0;
      for (const date of monthDates) {
        const daily = report.getReport(date);
        if (!daily) continue;
        totalSec += daily.totalUsage().seconds;
        totalJobs += daily.numJobs;
        totalWaitSec += daily.totalWaitSeconds;
      }
      return [
        month,
        round2(secondsToHours(totalSec)),
        totalJobs,
        totalJobs > 0 ? Math.round(totalWaitSec / totalJobs / 60) : '',
      ];
    }),
  ];

  // ── Sheet 3: Usage by user (hours) ───────────────────────────────────────
  const usageByUser: any[][] = [
    ['Date', ...users, 'Total (h)'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) =>
        round2(secondsToHours((daily?.usageForUser(u) ?? { seconds: 0 }).seconds)),
      );
      return [date, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
    }),
  ];

  // ── Sheet 4: Jobs by user ─────────────────────────────────────────────────
  const jobsByUser: any[][] = [
    ['Date', ...users, 'Total'],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) => daily?.userJobCounts[u] ?? 0);
      return [date, ...vals, vals.reduce((s, v) => s + v, 0)];
    }),
  ];

  // ── Sheet 5: Average wait by user (minutes) ───────────────────────────────
  const waitByUser: any[][] = [
    ['Date', ...users, 'Total avg (min)'],
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

  // ── Per-project sheets (only when multiple distinct projects) ─────────────
  // Built before per-user sheets so they appear first in the workbook.
  const distinctProjects = [...new Set(reports.map((r) => r.project))].sort();
  const projectSheets: SheetSpec[] = [];
  if (distinctProjects.length > 1) {
    // Build a map: project → combined report for that project
    const byProject = new Map<string, ProjectUsageReport>();
    for (const r of reports) {
      const existing = byProject.get(r.project);
      byProject.set(
        r.project,
        existing ? ProjectUsageReport.combine([existing, r]) : r,
      );
    }

    const allDates = [
      ...new Set(reports.flatMap((r) => r.dates)),
    ].sort();
    const allMonths = [...new Set(allDates.map((d) => d.slice(0, 7)))].sort();

    // Usage by project (monthly)
    const usageByProject: any[][] = [
      ['Month', ...distinctProjects, 'Total (h)'],
      ...allMonths.map((month) => {
        const monthDates = allDates.filter((d) => d.startsWith(month));
        const vals = distinctProjects.map((proj) => {
          const pr = byProject.get(proj);
          if (!pr) return 0;
          return round2(
            monthDates.reduce((s, d) => {
              const daily = pr.getReport(d);
              return s + (daily ? secondsToHours(daily.totalUsage().seconds) : 0);
            }, 0),
          );
        });
        return [month, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];

    // Jobs by project (monthly)
    const jobsByProject: any[][] = [
      ['Month', ...distinctProjects, 'Total'],
      ...allMonths.map((month) => {
        const monthDates = allDates.filter((d) => d.startsWith(month));
        const vals = distinctProjects.map((proj) => {
          const pr = byProject.get(proj);
          if (!pr) return 0;
          return monthDates.reduce(
            (s, d) => s + (pr.getReport(d)?.numJobs ?? 0),
            0,
          );
        });
        return [month, ...vals, vals.reduce((s, v) => s + v, 0)];
      }),
    ];

    // Wait by project (monthly)
    const waitByProject: any[][] = [
      ['Month', ...distinctProjects, 'Total avg (min)'],
      ...allMonths.map((month) => {
        const monthDates = allDates.filter((d) => d.startsWith(month));
        const vals = distinctProjects.map((proj) => {
          const pr = byProject.get(proj);
          if (!pr) return '';
          let totalJobs = 0;
          let totalWait = 0;
          for (const d of monthDates) {
            const daily = pr.getReport(d);
            if (!daily) continue;
            totalJobs += daily.numJobs;
            totalWait += daily.totalWaitSeconds;
          }
          return totalJobs > 0 ? Math.round(totalWait / totalJobs / 60) : '';
        });
        // Overall avg wait for this month
        let grandJobs = 0;
        let grandWait = 0;
        for (const proj of distinctProjects) {
          const pr = byProject.get(proj);
          if (!pr) continue;
          for (const d of monthDates) {
            const daily = pr.getReport(d);
            if (!daily) continue;
            grandJobs += daily.numJobs;
            grandWait += daily.totalWaitSeconds;
          }
        }
        return [
          month,
          ...vals,
          grandJobs > 0 ? Math.round(grandWait / grandJobs / 60) : '',
        ];
      }),
    ];

    projectSheets.push({ name: 'Usage by project', rows: usageByProject });
    projectSheets.push({ name: 'Jobs by project', rows: jobsByProject });
    projectSheets.push({ name: 'Wait by project', rows: waitByProject });
  }

  const sheets: SheetSpec[] = [
    { name: 'Daily totals', rows: dailyTotals },
    { name: 'Monthly totals', rows: monthlyTotals },
    ...projectSheets,
    { name: 'Usage by user', rows: usageByUser },
    { name: 'Jobs by user', rows: jobsByUser },
    { name: 'Wait by user', rows: waitByUser },
  ];

  // ── Per-component sheets ──────────────────────────────────────────────────
  for (const comp of components) {
    const compRows: any[][] = [
      ['Date', ...users, 'Total (h)'],
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
    sheets.push({ name: `Comp ${comp}`.slice(0, 31), rows: compRows });
  }

  return sheets;
}

export function downloadUsageExcel(
  reports: ProjectUsageReport[],
  title: string,
): void {
  const sheets = buildUsageSheets(reports);
  downloadMultiSheetExcel(`${title}.xlsx`, sheets);
}

// ── Storage report ────────────────────────────────────────────────────────────

const GB = 1024 ** 3;
// 6 decimal places: precise to ~1 KB, prevents small values rounding to zero
const toGB = (bytes: number) => +(bytes / GB).toFixed(6);

function buildStorageSheets(report: ProjectStorageReport): SheetSpec[] {
  const uids = report.userIdentifiers();
  // Use full local_username (e.g. "chris.aiproject") — unique across projects
  const displayNames = uids.map((uid) => report.users[uid] ?? uid);
  const dates = report.dates;
  const volumes = report.volumes();

  // ── Sheet 1: Snapshot — current quota state per user/volume ──────────────
  const snapshotRows: any[][] = [
    ['Type', 'User', 'Volume', 'Usage (GB)', 'Limit (GB)', '% Used'],
  ];
  for (const [vol, q] of Object.entries(report.projectQuotas)) {
    snapshotRows.push([
      'Project',
      '-',
      vol,
      toGB(q.usageBytes),
      isFinite(q.limitBytes) ? toGB(q.limitBytes) : '',
      +(q.usedFraction * 100).toFixed(1),
    ]);
  }
  for (const uid of uids) {
    const displayName = report.users[uid] ?? uid;
    for (const [vol, q] of Object.entries(report.quotaForUser(uid))) {
      snapshotRows.push([
        'User',
        displayName,
        vol,
        toGB(q.usageBytes),
        isFinite(q.limitBytes) ? toGB(q.limitBytes) : '',
        +(q.usedFraction * 100).toFixed(1),
      ]);
    }
  }

  // ── Sheet 2: Daily user totals (GB) ──────────────────────────────────────
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

  // ── Sheet 3: Monthly user totals (last reading per month) ─────────────────
  const allMonths = [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  const monthlyTotals: any[][] = [
    ['Month', ...displayNames, 'Total (GB)'],
    ...allMonths.map((month) => {
      const monthDates = dates.filter((d) => d.startsWith(month));
      const lastDate = monthDates[monthDates.length - 1];
      const daily = report.getReport(lastDate);
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
      return [month, ...vals, toGB(totalBytes)];
    }),
  ];

  const sheets: SheetSpec[] = [
    { name: 'Snapshot', rows: snapshotRows },
    { name: 'Daily user totals', rows: dailyTotals },
    { name: 'Monthly user totals', rows: monthlyTotals },
  ];

  // ── Per-volume sheets ─────────────────────────────────────────────────────
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
    sheets.push({ name: `Vol ${vol}`.slice(0, 31), rows: volRows });
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

// ── Allocation summary ────────────────────────────────────────────────────────

const parseNum = (v: string) => parseFloat(v) || 0;

const addDaysLocal = (d: Date, days: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

const toDateStrLocal = (d: Date): string => d.toISOString().slice(0, 10);

const daysBetweenLocal = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86_400_000);

function buildAllocationSheets(
  summaries: ProjectAccountingSummary[],
  currencyName: string,
): SheetSpec[] {
  const round2 = (n: number) => +n.toFixed(2);

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const summaryRows: any[][] = [
    [
      'Project',
      'Start date',
      'End date',
      `Total ${currencyName} awarded`,
      `Total ${currencyName} spent`,
      `Remaining ${currencyName}`,
    ],
    ...summaries.map((s) => {
      const spent = parseNum(s.total_spend) + parseNum(s.current_month_spend);
      const remaining = round2(parseNum(s.total_credits) - spent);
      return [
        s.project_name,
        s.start_date ?? '',
        s.end_date ?? '',
        round2(parseNum(s.total_credits)),
        round2(spent),
        remaining,
      ];
    }),
  ];

  const sheets: SheetSpec[] = [{ name: 'Summary', rows: summaryRows }];

  // ── Sheet 2: Burn-down ────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eligible = summaries.filter((s) => {
    if (!s.end_date) return false;
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    return end > today;
  });

  if (eligible.length > 0) {
    const endDates = eligible.map((s) => {
      const d = new Date(s.end_date!);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const maxEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

    const dates: string[] = [];
    for (let i = 0; ; i++) {
      const d = addDaysLocal(today, i);
      if (d >= maxEnd) break;
      dates.push(toDateStrLocal(d));
    }

    const projectNames = eligible.map((s) => s.project_name);
    const burnRows: any[][] = [
      ['Date', ...projectNames, `Total ${currencyName} remaining`],
      ...dates.map((dateStr) => {
        const d = new Date(dateStr);
        const vals = eligible.map((s) => {
          const remaining =
            parseNum(s.total_credits) -
            parseNum(s.total_spend) -
            parseNum(s.current_month_spend);
          const end = new Date(s.end_date!);
          end.setHours(0, 0, 0, 0);
          if (d >= end) return 0;
          const totalDays = Math.max(1, daysBetweenLocal(today, end));
          const daysFromToday = daysBetweenLocal(today, d);
          const daysLeft = totalDays - daysFromToday;
          return round2(Math.max(0, (remaining * daysLeft) / totalDays));
        });
        return [dateStr, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];

    sheets.push({ name: 'Burn-down', rows: burnRows });
  }

  return sheets;
}

export function downloadAllocationExcel(
  summaries: ProjectAccountingSummary[],
  currencyName: string,
  title: string,
): void {
  const sheets = buildAllocationSheets(summaries, currencyName);
  downloadMultiSheetExcel(`${title}.xlsx`, sheets);
}

// ── JSON download ─────────────────────────────────────────────────────────────

export function downloadJson(items: object[], filename: string): void {
  const blob = new Blob([JSON.stringify(items, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, filename);
}
