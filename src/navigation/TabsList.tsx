/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  UISrefActive,
  UISrefProps,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { Link } from '@waldur/core/Link';

import { useTabs } from './useTabs';

const MenuLink: FunctionComponent<
  UISrefProps & { className?: string; disabled?: boolean }
> = ({ to, params, disabled, children, className }) =>
  to && !disabled ? (
    <Link
      state={to}
      params={params}
      className={classNames('menu-link', className)}
    >
      {children}
    </Link>
  ) : (
    <a className={classNames('menu-link', disabled && 'disabled', className)}>
      {children}
    </a>
  );

const findActiveTab = (tabs, router) =>
  tabs.find(
    (parent) =>
      router.stateService.is(parent.to, parent.params) ||
      parent.children?.find((child) =>
        router.stateService.is(child.to, child.params),
      ),
  );

export const TabsList: FunctionComponent = () => {
  const tabs = useTabs();
  const router = useRouter();
  const updateActiveTab = useCallback(
    () => setActiveTab(findActiveTab(tabs, router)),
    [tabs, router],
  );
  const [activeTab, setActiveTab] = useState();
  useEffect(updateActiveTab, [tabs, router]);
  useOnStateChanged(updateActiveTab);

  return (
    <>
      {tabs.map((parentTab, parentIndex) =>
        parentTab.children?.length > 0 ? (
          <span
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="bottom-start"
            className={classNames(
              'menu-item menu-lg-down-accordion menu-sub-lg-down-indention me-0 me-lg-2',
              { here: parentTab === activeTab },
            )}
            key={parentIndex}
          >
            <MenuLink to={parentTab.to}>
              <span className="menu-title">{parentTab.title}</span>
              <span className="menu-arrow" />
            </MenuLink>
            <div className="menu-sub menu-sub-down-accordion menu-sub-dropdown px-2 py-4 w-200px">
              {parentTab.children.map((childTab, childIndex) => (
                <UISrefActive class="showing" key={childIndex}>
                  <Link
                    state={childTab.to}
                    params={childTab.params}
                    className="menu-item"
                    data-kt-menu-trigger="click"
                  >
                    <span className="menu-link">
                      <span className="menu-title">{childTab.title}</span>
                    </span>
                  </Link>
                </UISrefActive>
              ))}
            </div>
          </span>
        ) : parentTab.to ? (
          <span
            key={parentIndex}
            className={classNames('menu-item text-nowrap', {
              here: parentTab === activeTab,
            })}
            data-kt-menu-trigger="click"
          >
            <MenuLink
              to={parentTab.to}
              params={parentTab.params}
              disabled={parentTab.disabled}
            >
              <span className="menu-title">{parentTab.title}</span>
            </MenuLink>
          </span>
        ) : null,
      )}
    </>
  );
};
