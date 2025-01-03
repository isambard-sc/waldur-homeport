import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as api from '@waldur/marketplace/category/admin/api';
import { Category } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { createActionStore } from '@waldur/resource/actions/testUtils';
import { useNotify } from '@waldur/store/hooks';

import { CategoryManageColumnsDialog } from './CategoryManageColumnsDialog';

const category = {
  uuid: 'category-uuid',
  title: 'Test Category',
  columns: [],
} as Category;

vi.mock('@waldur/marketplace/category/admin/api');
vi.mock('@waldur/store/hooks');
vi.mock('@waldur/modal/actions');

describe('CategoryManageColumnsDialog', () => {
  const renderDialog = () => {
    return render(
      <Provider store={createActionStore()}>
        <CategoryManageColumnsDialog resolve={{ category }} />
      </Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNotify).mockReturnValue({
      showError: vi.fn(),
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    });
  });

  it('renders dialog with title and form', async () => {
    vi.mocked(api.getCategoryColumns).mockResolvedValue([]);

    renderDialog();
    await screen.findByText('Set columns in Test Category category');
    expect(
      screen.getByText(
        `Category ${category.title} does not contain a column yet.`,
      ),
    ).toBeInTheDocument();
  });

  it('allows adding a new column', async () => {
    vi.mocked(api.getCategoryColumns).mockResolvedValue([]);

    renderDialog();
    await screen.findByText('Set columns in Test Category category');

    const addButton = screen.getByText('Add column');
    fireEvent.click(addButton);

    // After clicking add button, the form should show column fields
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Attribute')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Index')).toBeInTheDocument();

    const user = userEvent.setup();

    // Fill in form fields
    await user.type(screen.getAllByRole('textbox')[0], 'Test Column');
    await user.type(screen.getAllByRole('textbox')[1], 'test_attribute');
    await user.type(screen.getAllByRole('textbox')[2], '1');

    // Submit form
    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    // Verify API call
    expect(api.createCategoryColumn).toHaveBeenCalledWith({
      title: 'Test Column',
      attribute: 'test_attribute',
      index: '1',
    });
  });

  it('allows removing an existing column', async () => {
    const existingColumn = {
      uuid: 'col1-uuid',
      title: 'Existing Column',
      attribute: 'existing_attr',
      index: 1,
    };

    vi.mocked(api.getCategoryColumns).mockResolvedValue([existingColumn]);

    const { container } = renderDialog();
    await screen.findByText('Set columns in Test Category category');

    // Verify existing column is displayed
    expect(screen.getByDisplayValue('Existing Column')).toBeInTheDocument();

    // Click delete button for the column
    const deleteButton = container.querySelector(
      'button[aria-description="Delete"]',
    );
    await userEvent.click(deleteButton);

    // Mock confirmation dialog to return true
    vi.mocked(waitForConfirmation).mockRejectedValue(true);
    // Verify API call
    expect(api.deleteCategoryColumn).toHaveBeenCalledWith(existingColumn.uuid);
  });
});
