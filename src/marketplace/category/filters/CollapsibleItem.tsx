import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { useBoolean } from 'react-use';

import './CollapsibleItem.scss';

interface CollapsibleItemProps {
  title: ReactNode;
  selected?: boolean;
  counter?: number;
}

export const CollapsibleItem: FC<PropsWithChildren<CollapsibleItemProps>> = (
  props,
) => {
  const [collapsed, onClick] = useBoolean(false);
  return (
    <div className="collapsible-item">
      <div
        className={classNames('collapsible-item__title', {
          selected: props.selected,
        })}
        onClick={onClick}
        aria-hidden="true"
      >
        {props.title}{' '}
        {collapsed ? (
          <i className="fa fa-chevron-up" />
        ) : (
          <i className="fa fa-chevron-down" />
        )}{' '}
        {props.counter !== 0 && `(${props.counter})`}
      </div>
      <div className={classNames('collapsible-item__content', { collapsed })}>
        {props.children}
      </div>
    </div>
  );
};
