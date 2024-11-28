import { FC, PropsWithChildren, ReactNode } from 'react';

interface MenuAccordionProps {
  title: ReactNode;
  itemId?: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export const MenuAccordion: FC<PropsWithChildren<MenuAccordionProps>> = (
  props,
) => (
  <div
    className="menu-item menu-accordion"
    data-kt-menu-trigger="click"
    data-kt-menu-permanent="true"
    id={props.itemId}
  >
    <span className="menu-link">
      {props.icon && (
        <span className="menu-icon">
          <span className="svg-icon svg-icon-2">{props.icon}</span>
        </span>
      )}
      <span className="menu-title">{props.title}</span>
      {Boolean(props.badge) && (
        <span className="menu-badge">{props.badge}</span>
      )}
      <span className="menu-arrow" />
    </span>
    <div className="menu-sub menu-sub-accordion menu-rounded-0">
      {props.children}
    </div>
  </div>
);
