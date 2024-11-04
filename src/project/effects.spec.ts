import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { showSuccess } from '@waldur/store/notify';

import * as actions from './actions';
import { setupFixture } from './effects.fixture';

describe('Project side-effects', () => {
  const project = { uuid: 'uuid', name: 'name' };

  let fixture: ReturnType<typeof setupFixture>;
  beforeEach(() => {
    fixture = setupFixture({ workspace: { customer: { projects: [] } } });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('invalidates projects list cache if project has been updated', async () => {
    fixture.mockUpdateProject.mockReturnValue({ data: project });
    await fixture.updateProject({ payload: { project } });
    // TODO: Check that customer is updated
  });

  it('shows success message if project has been updated', async () => {
    fixture.mockUpdateProject.mockReturnValue({ data: project });
    await fixture.updateProject({ payload: { project } });
    expect(fixture.dispatched).toContainEqual(
      showSuccess('Project has been updated.'),
    );
  });

  it('rejects promise if project update API request has failed', async () => {
    fixture.mockUpdateProject.mockReturnValue(
      Promise.reject({ data: 'Name is duplicate.' }),
    );
    await fixture.updateProject({ payload: { project } });
    const createFailure = actions.updateProject.failure().type;
    expect(fixture.hasActionWithType(createFailure)).toBe(true);
  });
});
