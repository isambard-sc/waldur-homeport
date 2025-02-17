import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import Avatar from '@waldur/core/Avatar';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { ThemeSwitcher } from '../../theme/ThemeSwitcher';

import { LanguageSelectorDropdown } from './LanguageSelectorDropdown';
import { UserDropdownMenuItems } from './UserDropdownMenuItems';
import { UserToken } from './UserToken';

export const UserDropdownMenu: FunctionComponent = () => {
  const user = useSelector(getUser) as UserDetails;
  return (
    <>
      <div
        className="btn btn-active-light d-flex align-items-center bg-hover-light py-2 px-2 px-md-3"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom"
        data-kt-menu-flip="bottom"
        data-cy="user-dropdown-trigger"
      >
        <div className="cursor-pointer symbol symbol-30px symbol-md-40px justify-content-center">
          {!user ? (
            <ImagePlaceholder width="40px" height="40px" />
          ) : user.image ? (
            <div
              className="symbol-label"
              style={{ backgroundImage: `url(${user.image})` }}
            />
          ) : (
            <Avatar
              className="symbol symbol-40px"
              name={user.full_name}
              size={40}
            />
          )}
        </div>
        <div className="d-none d-md-flex flex-column align-items-center justify-content-center me-2 mt-2">
          {!user?.is_staff && (
            <span className="text-muted fs-7 fw-semibold lh-1 mb-2">
              {translate('Hello')}
            </span>
          )}
          <span className="text-dark fs-base fw-bold lh-1">
            {user ? user.first_name : translate('Guest')}
          </span>
          {user?.is_staff && (
            <span className="badge badge-light-info fs-8 lh-1 mt-1 align-items-end">
              {translate('Staff')}
            </span>
          )}
        </div>
      </div>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
        data-kt-menu="true"
        data-popper-placement="bottom-end"
        data-cy="user-dropdown-menu"
      >
        <div className="menu-item px-3">
          <div className="menu-content d-flex align-items-center px-3">
            <div className="symbol symbol-50px me-5">
              {!user ? (
                <ImagePlaceholder width="40px" height="40px" />
              ) : user.image ? (
                <div
                  className="symbol-label"
                  style={{ backgroundImage: `url(${user.image})` }}
                />
              ) : (
                <Avatar
                  className="symbol symbol-40px"
                  name={user.full_name}
                  size={40}
                />
              )}
            </div>

            <div className="d-flex flex-column">
              <div className="fw-bolder d-flex align-items-center fs-5">
                {user ? user.full_name : translate('Guest')}
              </div>
              {user ? (
                <Link
                  state="profile.details"
                  className="fw-bold text-muted text-hover-primary fs-7"
                >
                  {user.email}
                </Link>
              ) : (
                <span className="fw-bold text-muted fs-7">
                  {translate('Not signed in')}
                </span>
              )}
            </div>
          </div>
        </div>

        {user ? (
          <UserDropdownMenuItems />
        ) : (
          <div className="d-grid gap-2 px-6">
            <Link
              state="login"
              className="btn btn-light btn-color-dark btn-active-color-dark"
            >
              {translate('Sign in')}
            </Link>
          </div>
        )}

        <div className="separator my-2" />

        <LanguageSelectorDropdown />

        {user && (
          <div className="menu-item px-5" data-kt-menu-trigger="click">
            <Link
              state="logout"
              className="menu-link px-5"
              aria-hidden="true"
              label={translate('Log out')}
            />
          </div>
        )}

        {!ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME && (
          <>
            <div className="separator my-2" />
            <ThemeSwitcher />
          </>
        )}

        {user && (
          <>
            <div className="separator my-2" />
            <UserToken token={user.token} />
          </>
        )}
      </div>
    </>
  );
};
