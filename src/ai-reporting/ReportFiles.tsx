import { FileIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';

import { ReportingFile } from './aiReportingApi';
import { useAuthenticatedBlobUrl } from './useAuthenticatedBlobUrl';

const IMAGE_RE = /\.(png|jpe?g|gif|svg)$/i;
const isImage = (f: ReportingFile) => IMAGE_RE.test(f.name);

const ReportImage: FC<{ file: ReportingFile }> = ({ file }) => {
  const src = useAuthenticatedBlobUrl(file.file);
  return (
    <figure className="mb-3">
      {src ? (
        <img src={src} alt={file.name} className="img-fluid rounded border" />
      ) : (
        <div className="text-muted fs-8">{translate('Loading image...')}</div>
      )}
      <figcaption className="fs-8 text-muted mt-1 d-flex align-items-center gap-2">
        <span>{file.name}</span>
        {/* The inline preview above is just for viewing in the page - for
            pulling the chart into a slide deck or saving it, it needs an
            explicit download the same way a PDF/CSV already gets. */}
        <FileDownloader url={file.file} name={file.name} size={14} />
      </figcaption>
    </figure>
  );
};

// FileDownloader (not a plain <a href>), and blob-fetched <img> (not a plain
// <img src>): the media endpoint is token-authenticated, so a bare link or
// image navigation can't carry the app's Authorization header and 404s
// (Waldur's media access is deny-by-default, so an unauthenticated request
// looks the same as a nonexistent file). Both fetch through the app's own
// authenticated client instead.
export const ReportFiles: FC<{ files: ReportingFile[] }> = ({ files }) => {
  if (!files.length) return null;

  const images = files.filter(isImage);
  const others = files.filter((f) => !isImage(f));

  return (
    <div className="ai-reporting-files mt-2">
      {images.map((f) => (
        <ReportImage key={f.uuid} file={f} />
      ))}

      {others.length > 0 && (
        <>
          <p className="fs-8 text-muted mb-1">
            {translate('Files generated:')}
          </p>
          <ul className="list-unstyled mb-0">
            {others.map((f) => (
              <li
                key={f.uuid}
                className="d-flex align-items-center gap-2 fs-7 mb-1"
              >
                <FileIcon size={16} weight="bold" />
                <span>{f.name}</span>
                <FileDownloader url={f.file} name={f.name} size={16} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
