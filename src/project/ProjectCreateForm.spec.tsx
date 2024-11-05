import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { actWait, updateWrapper } from '@waldur/core/testUtils';

import * as api from './api';
import { ProjectCreateForm } from './ProjectCreateForm';

vi.mock('./api');

const apiMock = vi.mocked(api);

vi.mock('@waldur/configs/default', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        OECD_FOS_2007_CODE_MANDATORY: false,
      },
    },
  },
}));

vi.mock('@waldur/i18n', () => ({
  translate: (arg) => arg,
}));

const renderForm = async () => {
  const mockStore = configureStore();
  const store = mockStore({
    workspace: {},
    config: {
      FEATURES: [],
    },
  });
  const wrapper = mount(
    <Provider store={store}>
      <ProjectCreateForm onSubmit={vi.fn()} />
    </Provider>,
  );
  await actWait();

  expect(wrapper.find(LoadingSpinner)).toBeTruthy();

  await updateWrapper(wrapper);
  return wrapper;
};

describe('ProjectCreateForm', () => {
  it('conceals type selector if choices list is empty', async () => {
    apiMock.loadProjectTypes.mockResolvedValue([]);
    const wrapper = await renderForm();
    expect(wrapper.find({ label: 'Project type' }).length).toBeFalsy();
  });

  it('renders type selector if choices are available', async () => {
    const projectTypes = [{ name: 'Basic', url: 'VALID_URL' }];
    apiMock.loadProjectTypes.mockResolvedValue(projectTypes);
    const wrapper = await renderForm();
    expect(wrapper.find({ label: 'Project type' }).length).toBeTruthy();
  });
});
