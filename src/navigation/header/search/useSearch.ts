import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  customersList,
  marketplaceResourcesList,
  projectsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@waldur/core/api';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);

  const handleClickOutside = useCallback(
    (e) => {
      const popup = document.getElementById('GlobalSearch');
      const input = document.getElementById('searchContainer');
      if (!popup || !input) {
        return;
      }
      if (!popup.contains(e.target) && !input.contains(e.target)) {
        setShow(false);
      }
    },
    [setShow],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const result = useQuery(
    [`global-search`, query],
    async ({ signal }) => {
      const organizationsPromise = customersList({
        signal,
        query: {
          query: query,
          field: ['name', 'display_name', 'uuid', 'abbreviation', 'image'],
        },
      });
      const projectsPromise = projectsList({
        signal,
        query: {
          query: query,
          field: ['name', 'uuid', 'image', 'customer_name', 'customer_uuid'],
        },
      });
      const resourcesPromise = marketplaceResourcesList({
        signal,
        query: {
          query: query,
          state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
          field: [
            'name',
            'uuid',
            'category_title',
            'offering_thumbnail',
            'customer_name',
            'customer_uuid',
            'project_name',
            'project_uuid',
            'state',
          ],
        },
      });
      const [organizations, projects, resources] = await Promise.all([
        organizationsPromise,
        projectsPromise,
        resourcesPromise,
      ]);

      const customersCount = fetchResultCount(organizations);
      const projectsCount = fetchResultCount(projects);
      const resourcesCount = fetchResultCount(resources);

      return {
        customers: organizations.data,
        customersCount,
        projects: projects.data,
        projectsCount,
        resources: resources.data,
        resourcesCount,
        resultsCount: customersCount + projectsCount + resourcesCount,
      };
    },
    { staleTime: 60 * 1000, keepPreviousData: true, enabled: show },
  );
  return { query, setQuery, result, show, setShow };
};

export type SearchResult = ReturnType<typeof useSearch>['result'];
