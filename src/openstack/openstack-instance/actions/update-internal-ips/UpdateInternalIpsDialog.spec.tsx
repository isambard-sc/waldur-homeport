import Select from 'react-select';
import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeInstance,
  fakeSubnet,
} from './UpdateInternalIpsDialog.fixture';

vi.mock('@waldur/openstack/api');

const apiMock = vi.mocked(api);

describe('UpdateInternalIpsDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadSubnets.mockResolvedValue([fakeSubnet]);
  });

  it('sends REST API request when form is being submitted', async () => {
    // Arrange
    apiMock.updatePorts.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updatePorts).toBeCalledWith(fakeInstance.uuid, {
      ports: [
        {
          subnet: fakeSubnet.url,
        },
      ],
    });
  });

  it('allows to disconnect VM from subnet', async () => {
    // Arrange
    apiMock.updatePorts.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.wrapper.find(Select).instance()['select'].clearValue();
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.updatePorts).toBeCalledWith(fakeInstance.uuid, {
      ports: [],
    });
  });
});
