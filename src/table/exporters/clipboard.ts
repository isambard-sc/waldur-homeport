import copy from 'copy-to-clipboard';
import Papa from 'papaparse';

export default function exportToClipboard(_, data) {
  const text = Papa.unparse(data);
  copy(text);
}
