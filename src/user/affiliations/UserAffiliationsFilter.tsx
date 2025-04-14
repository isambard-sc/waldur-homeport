import { Field, reduxForm } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { StringField } from '@waldur/form';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { InvitationRoleFilter } from '@waldur/invitations/InvitationRoleFilter';
import { InvitationScopeTypeFilter } from '@waldur/invitations/InvitationScopeTypeFilter';
import { ROLE_TYPES } from '@waldur/permissions/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const UserAffiliationsFilter = reduxForm<any, {}>({
  form: 'UserAffiliationsFilter',
  touchOnChange: true,
  destroyOnUnmount: false,
})(() => {
  const hideCallScope = !isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );
  const SCOPE_TYPE_OPTIONS = hideCallScope
    ? ROLE_TYPES.filter(
        (type) =>
          type.value !== 'call' &&
          type.value !== 'call_organizer' &&
          type.value !== 'proposal',
      )
    : ROLE_TYPES;

  return (
    <>
      <InvitationScopeTypeFilter options={SCOPE_TYPE_OPTIONS} />
      <TableFilterItem
        title={translate('Scope name')}
        name="scope_name"
        getValueLabel={(value) => value}
      >
        <Field
          name="scope_name"
          component={StringField}
          {...REACT_SELECT_TABLE_FILTER}
          placeholder={translate('Enter scope name')}
        />
      </TableFilterItem>
      <InvitationRoleFilter />
    </>
  );
});
