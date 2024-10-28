import { FunctionComponent } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { CategoryColumn } from '@waldur/marketplace/types';
import { validateIP } from '@waldur/marketplace/utils';
import { IPList } from '@waldur/resource/IPList';

import { Resource } from '../types';

interface CategoryColumnFieldProps {
  row: Resource;
  column: CategoryColumn;
}

export const CategoryColumnField: FunctionComponent<
  CategoryColumnFieldProps
> = (props) => {
  const metadata = props.row.backend_metadata;
  const value = props.column.attribute
    ? metadata[props.column.attribute]
    : undefined;

  switch (props.column.widget) {
    case 'csv':
      if (!Array.isArray(value) || value.length === 0) {
        return 'N/A';
      }
      if (validateIP(value[0])) {
        return <IPList value={value} />;
      } else {
        return value.join(', ');
      }

    case 'filesize':
      return formatFilesize(value);

    case 'attached_instance':
      // TODO: render as a link to the instance after - building different resource relationships architecture
      return metadata.instance_name;

    default:
      return value || 'N/A';
  }
};
