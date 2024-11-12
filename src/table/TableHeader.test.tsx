import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TableHeader } from './TableHeader';

vi.mock('./TableFiltersMenu', () => ({
  TableFiltersMenu: () => <div data-testid="table-filters-menu" />,
}));

const mockColumns = [
  { id: 'name', title: 'Name', orderField: 'name' },
  { id: 'email', title: 'Email', orderField: 'email' },
];

const mockRows = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

const defaultProps = {
  columns: mockColumns as any,
  rows: mockRows,
  columnPositions: ['name', 'email'],
  toggleFilterMenu: vi.fn(),
};

const renderTableHeader = (props = {}) => {
  return render(<TableHeader {...defaultProps} {...props} />);
};

describe('TableHeader', () => {
  it('renders column headers', () => {
    renderTableHeader();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('handles sort click', () => {
    const onSortClick = vi.fn();
    renderTableHeader({
      onSortClick,
      currentSorting: { field: 'name', mode: 'asc' },
    });

    const sortDescButton = screen.getAllByTestId('sort-desc')[0];
    fireEvent.click(sortDescButton);
    expect(onSortClick).toHaveBeenCalledWith({ field: 'name', mode: 'desc' });
  });

  it('shows select all checkbox when multiSelect is enabled', () => {
    const onSelectAllRows = vi.fn();
    renderTableHeader({
      enableMultiSelect: true,
      onSelectAllRows,
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(onSelectAllRows).toHaveBeenCalledWith(mockRows);
  });

  it('handles select-all checkbox states correctly', () => {
    const onSelectAllRows = vi.fn();
    const { rerender } = renderTableHeader({
      enableMultiSelect: true,
      onSelectAllRows,
      selectedRows: [],
    });

    const checkbox = screen.getByTestId('select-all') as HTMLInputElement;
    expect(checkbox.checked).toBeFalsy();
    expect(checkbox.indeterminate).toBeFalsy();

    // Test partial selection
    rerender(
      <TableHeader
        {...defaultProps}
        enableMultiSelect={true}
        onSelectAllRows={onSelectAllRows}
        selectedRows={[mockRows[0]]}
      />,
    );
    expect(checkbox.indeterminate).toBeTruthy();

    // Test all selected
    rerender(
      <TableHeader
        {...defaultProps}
        enableMultiSelect={true}
        onSelectAllRows={onSelectAllRows}
        selectedRows={mockRows}
      />,
    );
    expect(checkbox.checked).toBeTruthy();
    expect(checkbox.indeterminate).toBeFalsy();
  });

  it('renders filters menu when filters are specified', () => {
    const mockFilters = () => <div>Filters</div>;
    renderTableHeader({
      columns: [{ ...mockColumns[0], filter: 'name' }] as any,
      columnPositions: ['name'],
      filters: mockFilters as any,
    });

    expect(screen.getByTestId('table-filters-menu')).toBeInTheDocument();
  });

  it('should not render sorting icon if there are no columns with order field', () => {
    renderTableHeader({
      columns: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
      ] as any,
    });

    expect(screen.queryByTestId('sort-asc')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sort-desc')).not.toBeInTheDocument();
  });

  it('should render column for expandable indicator if header has expandable row', () => {
    renderTableHeader({
      expandableRow: true,
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(mockColumns.length + 1);
  });

  it('should select all rows when clicking on select-all checkbox', () => {
    const onSelectAllRows = vi.fn();
    renderTableHeader({
      enableMultiSelect: true,
      onSelectAllRows,
      selectedRows: [],
    });

    const checkbox = screen.getByTestId('select-all');
    fireEvent.click(checkbox);

    expect(onSelectAllRows).toHaveBeenCalledWith(mockRows);
  });

  it('should render actions column when showActions is true', () => {
    renderTableHeader({
      showActions: true,
    });

    const actionsHeader = screen.getByText('Actions');
    expect(actionsHeader).toBeInTheDocument();

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(mockColumns.length + 1);
    expect(headers[headers.length - 1]).toContainElement(actionsHeader);
  });

  it('renders columns in order specified by columnPositions if table has optional columns', () => {
    renderTableHeader({
      columns: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'age', title: 'Age' },
      ] as any,
      columnPositions: ['email', 'age', 'name'],
      hasOptionalColumns: true,
    });

    const headers = screen.getAllByRole('columnheader');
    const headerTitles = headers.map((header) => header.textContent);
    expect(headerTitles).toEqual(['Email', 'Age', 'Name']);
  });
});
