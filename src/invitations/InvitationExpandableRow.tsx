import React from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';

import { Invitation } from './types';

export const InvitationExpandableRow: React.FC<{
  row: Invitation;
}> = ({ row }) => (
  <>
    <p>
      <b>{translate('Invitation link')}: </b>
      <CopyToClipboardContainer
        value={`${location.origin}/invitation/${row.uuid}/`}
      />
    </p>
    {row.civil_number && (
      <p>
        <b>{translate('Civil number')}: </b>
        {row.civil_number}
      </p>
    )}
    {row.scope_type && (
      <p>
        <b>{translate('Scope type')}: </b>
        {row.scope_type}
      </p>
    )}
    {row.scope_name && (
      <p>
        <b>{translate('Scope name')}: </b>
        {row.scope_type} {row.scope_name}
      </p>
    )}
    {row.extra_invitation_text && (
      <p style={{ whiteSpace: 'pre-line' }}>
        <b>{translate('Message')}: </b>
        {row.extra_invitation_text}
        {'\n\n'}
        {ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}
      </p>
    )}
  </>
);
