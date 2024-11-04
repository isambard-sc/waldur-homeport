import { Store } from 'redux';

import * as api from '@waldur/openstack/api';
import { createActionStore } from '@waldur/resource/actions/testUtils';

import {
  DialogFixture,
  fakeTenant,
  defaultSecurityGroup,
} from './CreateSecurityGroupDialog.fixture';

vi.mock('@waldur/openstack/api');

const apiMock = vi.mocked(api);

describe('CreateSecurityGroupDialog', () => {
  let store: Store;

  beforeEach(() => {
    store = createActionStore();
    apiMock.loadSecurityGroupsResources.mockResolvedValue([]);
  });

  it('sends REST API request when form is being submitted', async () => {
    // Arrange
    apiMock.loadSecurityGroupsResources.mockResolvedValue([
      defaultSecurityGroup,
    ]);
    apiMock.createSecurityGroup.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.name = 'TCP';
    dialog.description = 'Security group for incoming TCP requests';
    dialog.addRule();
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.createSecurityGroup).toBeCalledWith(fakeTenant.uuid, {
      name: 'TCP',
      description: 'Security group for incoming TCP requests',
      rules: [
        {
          direction: 'ingress',
          ethertype: 'IPv4',
          from_port: 443,
          protocol: 'tcp',
          to_port: 443,
        },
      ],
    });
  });

  it('allows to create empty group', async () => {
    // Arrange
    apiMock.createSecurityGroup.mockResolvedValue(null);
    const dialog = new DialogFixture(store);
    await dialog.render();
    await dialog.update();

    // Act
    dialog.name = 'Empty';
    dialog.description = 'Empty Security Group';
    dialog.submitForm();
    await dialog.update();

    // Assert
    expect(apiMock.createSecurityGroup).toBeCalledWith(fakeTenant.uuid, {
      name: 'Empty',
      description: 'Empty Security Group',
      rules: [],
    });
  });
});
