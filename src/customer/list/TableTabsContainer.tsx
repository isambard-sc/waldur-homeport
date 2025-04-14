import classNames from 'classnames';
import { FC } from 'react';
import { Tab, TabContainerProps } from 'react-bootstrap';

import './TableTabsContainer.scss';

export const TableTabsContainer: FC<TabContainerProps & { className? }> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={classNames('table-tabs-container', className)}>
      <Tab.Container {...props}>{children}</Tab.Container>
    </div>
  );
};
