import { IdentificationBadge, Question } from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { FC, ReactNode, useContext } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ResourceActionMenuContext } from '@waldur/marketplace/resources/actions/ResourceActionMenuContext';

export interface ActionItemProps {
  title: string;
  action: () => void;
  iconNode?: ReactNode;
  iconColor?: Variant;
  staff?: boolean;
  important?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  as?;
  size?: 'sm' | 'lg';
}

export const ActionItem: FC<ActionItemProps> = (props) => {
  const Component = props.as || Dropdown.Item;
  const actionMenuContext = useContext(ResourceActionMenuContext);
  if (
    actionMenuContext?.query &&
    !props.title
      .toLocaleLowerCase()
      .includes(actionMenuContext.query.toLocaleLowerCase())
  ) {
    return null;
  }
  if (actionMenuContext?.hideDisabled && props.disabled) {
    return null;
  }
  if (actionMenuContext?.hideNonImportant && !props.important) {
    return null;
  }
  return Component === Dropdown.Item || Component === Button ? (
    <div className="d-flex align-items-center">
      <Component
        className={classNames(
          'd-flex gap-3',
          props.className,
          props.disabled && 'bg-hover-lighten',
        )}
        // Workaround for rendering tooltips for disabled dropdown menu items.
        // See also: https://stackoverflow.com/questions/57349166/
        onClick={() => !props.disabled && props.action()}
        variant={Component === Button ? '' : undefined}
        size={Component === Button ? props.size : undefined}
        disabled={props.disabled}
      >
        <div className={props.disabled ? 'opacity-50' : undefined}>
          {props.iconNode && (
            <span
              className={classNames(
                'svg-icon svg-icon-2',
                props.iconColor && `svg-icon-${props.iconColor}`,
              )}
            >
              {props.iconNode}
            </span>
          )}
          {props.title}
        </div>
      </Component>
      {props.tooltip && (
        <Tip
          label={props.tooltip}
          id={`action-reason-${uniqueId()}`}
          className="ms-1 me-3"
        >
          <Question size={20} />
        </Tip>
      )}
      {props.staff && (
        <Tip
          label={translate('Staff action')}
          id={`staff-action-${uniqueId()}`}
          className="text-dark ms-auto ps-2"
        >
          <IdentificationBadge size={25} />
        </Tip>
      )}
    </div>
  ) : (
    <Component {...props} />
  );
};
