import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import type { AwardDetails } from '@waldur/openportal/bindings/AwardDetails';

import { AwardLockedDialog } from './AwardLockedDialog';

export { AwardLockedDialog as MembershipLockedDialog };

/** Convenience helper — dispatch the result to open the membership-locked dialog. */
export const membershipLockedDialog = (awardDetails: AwardDetails) =>
  openModalDialog(AwardLockedDialog, {
    resolve: {
      awardDetails,
      title: translate('Membership controlled by award'),
      message: translate(
        'Membership for this project is controlled through the funding award. To add or remove members, visit the award page.',
      ),
    },
  });

/** Convenience helper — dispatch the result to open the roles-locked dialog. */
export const rolesLockedDialog = (awardDetails: AwardDetails) =>
  openModalDialog(AwardLockedDialog, {
    resolve: {
      awardDetails,
      title: translate('Roles controlled by award'),
      message: translate(
        'Roles for this project are controlled through the funding award. To change a member\'s role, visit the award page.',
      ),
    },
  });
