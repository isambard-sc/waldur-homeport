import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { IBreadcrumbItem } from '@waldur/navigation/types';

interface HiddenItemsPopoverProps {
  items: IBreadcrumbItem[];
}

export const HiddenItemsPopover: FC<HiddenItemsPopoverProps> = ({ items }) => {
  return (
    <div className="mh-300px overflow-auto">
      <ul className="list-unstyled">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              state={item.to}
              params={item.params}
              className="d-block text-dark text-hover-primary bg-hover-primary-50 py-2 px-5"
              aria-hidden={true}
            >
              <span className="fs-6 fw-semibold">{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
