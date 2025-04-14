import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
}

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
}) => {
  return (
    <>
      <PublicResourceLink row={row} />
      <CopyToClipboardButton
        value={row.name}
        className="ms-2 text-hover-primary cursor-pointer d-inline-block"
      />
    </>
  );
};
