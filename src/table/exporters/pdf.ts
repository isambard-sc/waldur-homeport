import italics from '@fontsource/open-sans/files/open-sans-all-400-italic.woff';
import normal from '@fontsource/open-sans/files/open-sans-all-400-normal.woff';
import bolditalics from '@fontsource/open-sans/files/open-sans-all-800-italic.woff';
import bold from '@fontsource/open-sans/files/open-sans-all-800-normal.woff';
import pdfmake from 'pdfmake/build/pdfmake';

import { saveFile } from './saveFile';

function saveAsPdf(table, data) {
  const blob = new Blob([data], { type: 'application/pdf' });
  saveFile(blob, `${table}.pdf`);
}

const getAbsolutePath = (path) => new URL(path, document.baseURI).href;

const getFonts = () => ({
  OpenSans: {
    normal: getAbsolutePath(normal),
    bold: getAbsolutePath(bold),
    italics: getAbsolutePath(italics),
    bolditalics: getAbsolutePath(bolditalics),
  },
});

export default function exportAsPdf(table, data) {
  const header = data.fields.map((field) => ({
    text: field + '',
    style: 'tableHeader',
  }));
  const rows = data.data.map((row) =>
    row.map((cell) => ({
      text: cell + '',
    })),
  );
  const doc: Record<string, object> = {
    content: [
      {
        text: table,
        style: 'title',
      },
      {
        table: {
          body: [header].concat(rows),
        },
      },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#2d4154',
        alignment: 'center',
      },
      title: {
        alignment: 'center',
        fontSize: 15,
      },
    },
    defaultStyle: {
      font: 'OpenSans',
    },
  };
  const fonts = getFonts();
  const pdf = pdfmake.createPdf(doc, null, fonts);
  pdf.getBuffer((buffer) => saveAsPdf(table, buffer));
}
