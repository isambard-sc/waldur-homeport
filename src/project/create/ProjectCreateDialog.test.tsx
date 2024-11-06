import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as config from '@waldur/configs/default';
import { Customer } from '@waldur/workspace/types';

import { createProject, loadProjectTypes } from '../api';

import { ProjectCreateDialog } from './ProjectCreateDialog';

// Mock API calls
vi.mock('../api');

vi.mock('@waldur/configs/default');

describe('ProjectCreateDialog', () => {
  const mockedRefetch = vi.fn();

  const renderComponent = async () => {
    // Mock Redux store
    const mockStore = createStore(() => ({
      workspace: {
        user: {
          is_staff: true,
          permissions: [],
        },
        customer: {
          uuid: 'mock-customer-id',
        },
      },
    }));

    vi.mocked(createProject).mockResolvedValue({
      data: { uuid: 'mock-project-uuid' },
    } as any);

    const router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);

    await render(
      <Provider store={mockStore}>
        <UIRouter router={router}>
          <ProjectCreateDialog
            customer={{ uuid: 'mock-customer-id' } as Customer}
            refetch={mockedRefetch}
          />
        </UIRouter>
      </Provider>,
    );
  };

  beforeEach(() => {
    vi.mocked(config).ENV = {
      plugins: {
        WALDUR_CORE: {
          OECD_FOS_2007_CODE_MANDATORY: false,
        },
      },
      FEATURES: {
        project: {
          show_description_in_create_dialog: true,
          show_type_in_create_dialog: true,
        },
      },
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it('should render the form correctly', () => {
    vi.mocked(loadProjectTypes).mockResolvedValue([]);
    renderComponent();
    // Assert that the form fields are rendered
    expect(screen.getByText('Project name')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Project description')).toBeInTheDocument();
    expect(screen.queryByText('Project type')).not.toBeInTheDocument();
  });

  it('should conceal disabled feature fields', () => {
    vi.mocked(config).ENV = {
      plugins: {
        WALDUR_CORE: {
          OECD_FOS_2007_CODE_MANDATORY: false,
        },
      },
      FEATURES: {
        project: {
          show_description_in_create_dialog: false,
          show_type_in_create_dialog: true,
        },
      },
    } as any;
    renderComponent();
    // Assert that the form fields are rendered
    expect(screen.getByText('Project name')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.queryByText('Project description')).not.toBeInTheDocument();
    expect(screen.queryByText('Project type')).not.toBeInTheDocument();
  });

  it('should create a new project using entered values', async () => {
    vi.mocked(loadProjectTypes).mockResolvedValue([]);
    renderComponent();
    // Fill out the form
    await userEvent.type(screen.getByText('Project name'), 'Test Project');
    await userEvent.type(
      screen.getByText('Project description'),
      'This is a test project',
    );

    // Submit the form
    await userEvent.click(screen.getByText('Create'));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        customer: {
          uuid: 'mock-customer-id',
        },
        name: 'Test Project',
        description: 'This is a test project',
      });
      expect(mockedRefetch).toHaveBeenCalled();
    });
  });

  it('allows to select type if choices are available', async () => {
    vi.mocked(loadProjectTypes).mockResolvedValue([
      { name: 'Basic project type', url: 'basic-project-type-url' },
    ]);
    renderComponent();
    await userEvent.type(screen.getByText('Project name'), 'Test Project');
    await userEvent.type(
      screen.getByText('Project description'),
      'This is a test project',
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Basic project type'));

    // Submit the form
    await userEvent.click(screen.getByText('Create'));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        customer: {
          uuid: 'mock-customer-id',
        },
        name: 'Test Project',
        description: 'This is a test project',
        type: { name: 'Basic project type', url: 'basic-project-type-url' },
      });
      expect(mockedRefetch).toHaveBeenCalled();
    });
  });
});
