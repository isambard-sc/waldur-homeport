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
        {/* A download link too, for saving the chart or using it elsewhere. */}
        <FileDownloader url={file.file} name={file.name} size={14} />
      </figcaption>
    </figure>
  );
};

// The media endpoint needs the Authorization header, which a plain link
// or <img src> can't send, so both fetch through the app's own client.
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
