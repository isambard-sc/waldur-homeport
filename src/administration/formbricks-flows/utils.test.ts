import { describe, expect, it } from 'vitest';
import { FormbricksFlow } from 'waldur-js-client';

import { flowToFormValues, formValuesToPayload } from './utils';

const flow: FormbricksFlow = {
  url: 'https://example.com/api/proposal-formbricks-flows/flow-uuid/',
  uuid: 'flow-uuid',
  name: 'AIRR-GW',
  description: '',
  created: '2026-10-23T00:00:00Z',
  modified: '2026-10-23T00:00:00Z',
  calls_count: 1,
  steps: [
    {
      uuid: 'step-uuid',
      key: 'project_details',
      survey_id: 'survey-1',
      mapper: 'map_project_details',
      is_reviewer_visible: true,
      resource_question_id: 'q_resources',
      field_mappings: [
        { question_id: 'q_name', proposal_field: 'name', value_type: 'text' },
      ],
      resource_options: [
        {
          choice_label: 'Isambard-AI',
          offering: 'offering-uuid',
          offering_name: 'Isambard-AI',
          offering_slug: 'isambard-a-1',
          attribute_field_map: { q_gpus: 'allocation' },
          default_attributes: { storage: 10 },
        },
      ],
    },
    { uuid: 'step-2', key: 'team_details', survey_id: 'survey-2' },
  ],
};

describe('Formbricks flow form conversion', () => {
  it('round-trips a flow through the form values', () => {
    const payload = formValuesToPayload(flowToFormValues(flow));

    expect(payload).toEqual({
      name: 'AIRR-GW',
      description: '',
      steps: [
        {
          key: 'project_details',
          survey_id: 'survey-1',
          mapper: 'map_project_details',
          is_reviewer_visible: true,
          resource_question_id: 'q_resources',
          field_mappings: [
            {
              question_id: 'q_name',
              proposal_field: 'name',
              value_type: 'text',
            },
          ],
          resource_options: [
            {
              choice_label: 'Isambard-AI',
              offering: 'offering-uuid',
              attribute_field_map: { q_gpus: 'allocation' },
              // Edited as text in the form, so non-string values come back
              // as their JSON text.
              default_attributes: { storage: '10' },
            },
          ],
        },
        {
          key: 'team_details',
          survey_id: 'survey-2',
          mapper: '',
          is_reviewer_visible: false,
          resource_question_id: '',
          field_mappings: [],
          resource_options: [],
        },
      ],
    });
  });

  it('starts a new flow with one empty step', () => {
    expect(flowToFormValues().steps).toHaveLength(1);
  });

  it('drops key/value rows without a key', () => {
    const values = flowToFormValues(flow);
    values.steps[0].resource_options[0].attribute_field_map.push({
      key: '',
      value: 'ignored',
    });

    const payload = formValuesToPayload(values);

    expect(payload.steps[0].resource_options[0].attribute_field_map).toEqual({
      q_gpus: 'allocation',
    });
  });
});
