import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsList,
  proposalFormbricksFlowsChoicesRetrieve,
  proposalFormbricksFlowsUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { FormbricksFlowFormDialog } from './FormbricksFlowFormDialog';

const flow = {
  url: 'https://example.com/api/proposal-formbricks-flows/flow-uuid/',
  uuid: 'flow-uuid',
  name: 'AIRR-GW',
  description: '',
  created: '2026-10-23T00:00:00Z',
  modified: '2026-10-23T00:00:00Z',
  calls_count: 0,
  steps: [
    {
      uuid: 'step-uuid',
      key: 'project_details',
      survey_id: 'survey-1',
      mapper: 'map_project_details',
      is_reviewer_visible: true,
      resource_question_id: 'q_resources',
      field_mappings: [],
      resource_options: [],
    },
  ],
} as any;

describe('FormbricksFlowFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalFormbricksFlowsChoicesRetrieve).mockResolvedValue({
      data: {
        mappers: [{ value: 'map_project_details', label: 'Project details' }],
        proposal_fields: [{ value: 'name', label: 'Name' }],
        value_types: [{ value: 'text', label: 'Text' }],
      },
    } as any);
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'zenith-uuid', name: 'Zenith' }]),
    );
    vi.mocked(proposalFormbricksFlowsUpdate).mockResolvedValue({
      data: flow,
    } as any);
  });

  it('adds a resource to a step', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderWithProviders(
      <FormbricksFlowFormDialog resolve={{ row: flow, refetch }} />,
    );

    await user.click(
      await screen.findByRole('button', { name: /Add resource/ }),
    );
    await user.type(screen.getByLabelText(/Choice label/), 'Zenith');
    await openAndSelectOption(user, /^Offering/, 'Zenith');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(proposalFormbricksFlowsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'flow-uuid' },
        body: expect.objectContaining({
          steps: [
            expect.objectContaining({
              key: 'project_details',
              resource_options: [
                {
                  choice_label: 'Zenith',
                  offering: 'zenith-uuid',
                  attribute_field_map: {},
                  default_attributes: {},
                },
              ],
            }),
          ],
        }),
      }),
    );
    expect(refetch).toHaveBeenCalled();
  });
});
