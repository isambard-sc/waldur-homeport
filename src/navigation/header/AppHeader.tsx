import { List } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { fixURL } from '@waldur/core/api';
import DefaultLogo from '@waldur/images/logo.svg';
import { hasSupport as hasSupportSelector } from '@waldur/issues/hooks';
import { useUser } from '@waldur/workspace/hooks';

import { getTitle } from '../title';

import { BreadcrumbMain } from './breadcrumb/BreadcrumbMain';
import { ConfirmationDrawerToggle } from './ConfirmationDrawerToggle';
import { QuickIssueDrawerToggle } from './QuickIssueDrawerToggle';
import { SearchToggle } from './search/SearchToggle';
import { UserDropdownMenu } from './UserDropdown';

const AsideMobileToggle: FunctionComponent = () => (
  <div
    className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
    id="kt_aside_mobile_toggle"
  >
    <span className="svg-icon svg-icon-1">
      <List />
    </span>
  </div>
);

interface AppHeaderProps {
  hasBreadcrumbs?: boolean;
}

export const AppHeader: FunctionComponent<AppHeaderProps> = ({
  hasBreadcrumbs,
}) => {
  const pageTitle = useSelector(getTitle);
  const user = useUser();
  const imageUrl = fixURL('/icons/sidebar_logo_mobile/');

  const hasSupport = useSelector(hasSupportSelector);

  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div className="d-flex align-items-center d-lg-none ms-n2 me-2">
          <AsideMobileToggle />

          <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
            <div className="d-lg-none">
              {imageUrl ? (
                <img src={imageUrl} alt="Logo" className="h-30px" />
              ) : (
                <DefaultLogo className="h-30px" />
              )}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-stretch justify-content-between flex-grow-1">
          <div className="d-flex align-items-stretch justify-content-between flex-grow-1 flex-shrink-1">
            {hasBreadcrumbs ? (
              <BreadcrumbMain />
            ) : pageTitle ? (
              <div className="page-title d-flex align-items-center me-3">
                <h1 className="text-dark fw-boldest fs-2 my-1">{pageTitle}</h1>
              </div>
            ) : (
              <SearchToggle />
            )}
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            {user && (hasBreadcrumbs || pageTitle) && <SearchToggle />}
            {user && hasSupport && <QuickIssueDrawerToggle />}
            {user && <ConfirmationDrawerToggle />}
            <div className="d-flex align-items-center ms-1 ms-lg-3">
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
