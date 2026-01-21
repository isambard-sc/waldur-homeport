import JSZip from 'jszip';

import { saveFile } from './saveFile';

const templates = {
  '[Content_Types].xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="xml" ContentType="application/xml" />' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
    '</Types>',

  '_rels/.rels':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>',

  'xl/_rels/workbook.xml.rels':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>',

  'xl/workbook.xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets>' +
    '<sheet name="report" sheetId="1" r:id="rId1"/>' +
    '</sheets>' +
    '</workbook>',

  'xl/styles.xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1">' +
    '<numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/>' +
    '</numFmts>' +
    '<fonts count="1">' +
    '<font><sz val="11"/><name val="Calibri"/></font>' +
    '</fonts>' +
    '<fills count="1">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '</fills>' +
    '<borders count="1">' +
    '<border><left/><right/><top/><bottom/><diagonal/></border>' +
    '</borders>' +
    '<cellXfs count="4">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment wrapText="1"/></xf>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1" applyAlignment="1"><alignment wrapText="1"/></xf>' +
    '</cellXfs>' +
    '</styleSheet>',
};

// Default column width in Excel units (approximately characters)
const DEFAULT_COLUMN_WIDTH = 20;

export class SharedStrings {
  private strings: string[] = [];

  getIndex(value: string) {
    const index = this.strings.indexOf(value);
    if (index !== -1) {
      return index;
    }
    return this.strings.push(value) - 1;
  }

  escapeValue(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&apos;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;');
  }

  formatStrings() {
    return this.strings
      .map((value) => `<si><t>${this.escapeValue(value)}</t></si>`)
      .join('');
  }

  serialize() {
    const count = this.strings.length;
    return (
      '<?xml version="1.0" encoding="UTF-8"?>' +
      `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" uniqueCount="${count}" count="${count}">` +
      this.formatStrings() +
      '</sst>'
    );
  }
}

const getColumnLetter = (col) => {
  if (col <= 0) {
    throw Error('col must be more than 0');
  }
  const array = [];
  while (col > 0) {
    let remainder = col % 26;
    col /= 26;
    col = Math.floor(col);
    if (remainder === 0) {
      remainder = 26;
      col--;
    }
    array.push(64 + remainder);
  }
  return String.fromCharCode.apply(null, array.reverse());
};

function addToZip(zip, path, content) {
  const parts = path.split('/');
  const file = parts.pop();
  const folder = parts.reduce((dest, part) => dest.folder(part), zip);
  folder.file(file, content);
}

// Style indices:
// 0 = default (no wrap)
// 1 = date format (no wrap)
// 2 = text with wrap
// 3 = date with wrap

function formatCell(ref, type, value) {
  // Use style 2 for text wrapping
  return `<c r="${ref}" t="${type}" s="2"><v>${value}</v></c>`;
}

function formatFormulaCell(ref, formula) {
  // Escape XML characters in formula
  const escapedFormula = formula
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  // Use style 2 for text wrapping
  return `<c r="${ref}" t="str" s="2"><f>${escapedFormula}</f></c>`;
}

function formatDateCell(ref: string, date: Date) {
  // Excel dates start from Jan 1, 1900 (serial number 1).
  // JavaScript dates start from Jan 1, 1970 (serial number 25569).
  // There are 25569 days between 1900-01-01 and 1970-01-01.
  const EXCEL_EPOCH_DIFF = 25569;
  const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  // Get the time in milliseconds since the JS epoch (UTC)
  // Use getTime() which returns the UTC time value in milliseconds.
  const js_timestamp_utc = date.getTime();

  // Convert the JavaScript timestamp to days since the JS epoch
  const days_since_epoch = js_timestamp_utc / MILLISECONDS_IN_DAY;

  // Add the difference in days to get the Excel serial number
  // The fractional part represents the time of day.
  const excel_serial = days_since_epoch + EXCEL_EPOCH_DIFF;
  // Use style 3 for date format with text wrapping
  return `<c r="${ref}" t="n" s="3"><v>${excel_serial}</v></c>`;
}

export function getSheetData(sharedStrings: SharedStrings, rows: any[][]) {
  return rows
    .map((row, rowIndex) => {
      const rowRef = rowIndex + 1;
      const cells = row
        .map((value, cellIndex) => {
          const colRef = getColumnLetter(cellIndex + 1) + rowRef;

          // Check if value is a formula object
          if (value && typeof value === 'object' && value.formula) {
            return formatFormulaCell(colRef, value.formula);
          }

          // Check if value is a Date object
          if (value instanceof Date) {
            return formatDateCell(colRef, value);
          }

          switch (typeof value) {
            case 'boolean':
              return formatCell(colRef, 'b', value ? 1 : 0);
            case 'number':
              return formatCell(colRef, 'n', value);
            default:
              return formatCell(
                colRef,
                's',
                sharedStrings.getIndex(value + ''),
              );
          }
        })
        .join('');
      return `<row r="${rowRef}">${cells}</row>`;
    })
    .join('');
}

function getColumnDefinitions(columnCount: number, columnWidths?: number[]) {
  // Generate column width definitions for all columns
  // Uses custom widths if provided, otherwise falls back to DEFAULT_COLUMN_WIDTH
  let cols = '<cols>';
  for (let i = 1; i <= columnCount; i++) {
    const width = columnWidths?.[i - 1] ?? DEFAULT_COLUMN_WIDTH;
    cols += `<col min="${i}" max="${i}" width="${width}" customWidth="1"/>`;
  }
  cols += '</cols>';
  return cols;
}

function getSheet(
  sharedStrings: SharedStrings,
  rows: any[][],
  columnWidths?: number[],
) {
  // Determine number of columns from first row (headers)
  const columnCount = rows.length > 0 ? rows[0].length : 0;

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
    'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" ' +
    'xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
    getColumnDefinitions(columnCount, columnWidths) +
    '<sheetData>' +
    getSheetData(sharedStrings, rows) +
    '</sheetData>' +
    '</worksheet>'
  );
}

export default function exportExcel(table, data) {
  const zip = new JSZip();
  for (const path in templates) {
    if (Object.prototype.hasOwnProperty.call(templates, path)) {
      addToZip(zip, path, templates[path]);
    }
  }
  const sharedStrings = new SharedStrings();
  const rows = [data.fields].concat(data.data);
  const sheet = getSheet(sharedStrings, rows, data.columnWidths);
  addToZip(zip, 'xl/worksheets/sheet1.xml', sheet);
  addToZip(zip, 'xl/sharedStrings.xml', sharedStrings.serialize());
  zip
    .generateAsync({
      type: 'blob',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    .then((blob) => {
      saveFile(blob, `${table}.xlsx`);
    });
}
