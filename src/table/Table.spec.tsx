import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Table from './Table';

vi.mock('@waldur/table/useTableLoader', () => ({
  useTableLoader: () => false,
}));

describe('Table', () => {
  const fetch = vi.fn();
  const props = {
    loading: false,
    error: null,
    fetch,
    rows: [],
    sorting: {
      mode: undefined,
      field: null,
      loading: false,
    },
    activeColumns: {},
    columnPositions: [],
  };

  describe('special states', () => {
    it('renders message if loading failed', () => {
      render(<Table {...props} error="Not found" />);
      expect(screen.getByText('Unable to fetch data.')).toBeInTheDocument();
    });

    it('renders message if list is empty', () => {
      render(<Table {...props} />);
      expect(screen.getByText('There are no items yet.')).toBeInTheDocument();
    });

    it('renders custom message if list is empty and verboseName is set', () => {
      render(<Table {...props} verboseName="projects" />);
      expect(
        screen.getByText('There are no projects yet.'),
      ).toBeInTheDocument();
    });

    it('renders custom message if list is empty and verboseName is set and query is set', () => {
      render(<Table {...props} verboseName="projects" query="my projects" />);
      expect(
        screen.getByText('There are no projects found matching the filter.'),
      ).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    beforeEach(() => {
      render(
        <Table
          fetch={fetch}
          loading={false}
          error={null}
          pagination={{
            resultCount: 1,
            currentPage: 1,
            pageSize: 10,
          }}
          columns={[
            {
              title: 'Resource type',
              render: ({ row }) => row.type,
            },
            {
              title: 'Resource name',
              render: ({ row }) => row.name,
            },
          ]}
          rows={[
            {
              type: 'OpenStack Instance',
              name: 'Web server',
            },
          ]}
          activeColumns={{}}
          columnPositions={[]}
        />,
      );
    });

    it('renders column headers', () => {
      expect(screen.getByText('Resource type')).toBeInTheDocument();
      expect(screen.getByText('Resource name')).toBeInTheDocument();
    });

    it('renders row values', () => {
      expect(screen.getByText('OpenStack Instance')).toBeInTheDocument();
      expect(screen.getByText('Web server')).toBeInTheDocument();
    });
  });
});
