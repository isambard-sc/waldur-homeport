import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@waldur/marketplace/common/api';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

export const useOfferingCategories = (anonymous = false) => {
  const { data: categories } = useQuery(
    ['ResourcesMenu', 'Categories'],
    () =>
      getCategories({
        params: {
          field: ['uuid', 'title', 'group'],
          has_offerings: true,
        },
        ...(anonymous ? ANONYMOUS_CONFIG : {}),
      }),
    { refetchOnWindowFocus: false },
  );
  return categories;
};
