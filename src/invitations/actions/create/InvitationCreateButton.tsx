import { FunctionComponent } from 'react';

import { AddButton } from '@waldur/core/AddButton';

import { InvitationContext } from '../types';
import { useCreateInvitation } from '../useCreateInvitation';

export const InvitationCreateButton: FunctionComponent<
  Omit<InvitationContext, 'customer' | 'user'>
> = (context) => {
  const { callback, canInvite } = useCreateInvitation(context);

  return <AddButton action={callback} disabled={!canInvite} />;
};
