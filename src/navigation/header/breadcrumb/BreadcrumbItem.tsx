import { useSref } from '@uirouter/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { PropsWithChildren, forwardRef } from 'react';
import { Breadcrumb, BreadcrumbItemProps } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { TruncatedText } from '@waldur/core/TruncatedText';
import { truncate as truncateText } from '@waldur/core/utils';

interface OwnProps extends BreadcrumbItemProps {
  ellipsis?: 'md' | 'xl' | 'xxl';
  truncate?: boolean;
  maxLength?: number; // to truncate title always
  to?: string;
  params?: object;
  ref?;
}

export const BreadcrumbItem = forwardRef<any, PropsWithChildren<OwnProps>>(
  (
    {
      ellipsis = undefined,
      truncate,
      maxLength,
      children,
      className,
      to,
      params,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const ellipsisClass = ellipsis ? 'ellipsis-' + ellipsis : '';
    const sref = useSref(to || '404', params);

    return (
      <Breadcrumb.Item
        {...rest}
        {...(to ? sref : {})}
        onClick={(event) => {
          sref?.onClick && sref.onClick(event);
          onClick && onClick(event);
        }}
        ref={ref}
        className={classNames(className, ellipsisClass)}
      >
        {typeof children === 'string' ? (
          maxLength ? (
            <span>
              {children.length > maxLength + 5 ? (
                <Tip
                  label={children}
                  id={'tip-breadcrumb-' + uniqueId()}
                  placement="bottom"
                >
                  {truncateText(children, maxLength)}
                </Tip>
              ) : (
                children
              )}
            </span>
          ) : truncate ? (
            <TruncatedText text={children} padding={25} />
          ) : (
            <span>{children}</span>
          )
        ) : (
          <span>{children}</span>
        )}
      </Breadcrumb.Item>
    );
  },
);
