import { FileArrowDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';

// FileDownloader's button is named "Download" for every file; this names
// the file, so a screen reader can tell them apart.
export const DownloadFileButton: FC<{
  url: string;
  name: string;
  size?: number;
}> = ({ url, name, size = 16 }) => (
  <FileDownloader url={url} name={name}>
    <FileArrowDownIcon weight="bold" size={size} aria-hidden="true" />
    <span className="visually-hidden">
      {translate('Download {name}', { name })}
    </span>
  </FileDownloader>
);
