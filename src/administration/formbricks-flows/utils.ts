import {
  FormbricksFlow,
  FormbricksFlowRequest,
  MapperEnum,
  ProposalFieldEnum,
  ValueTypeEnum,
} from 'waldur-js-client';

/**
 * A `{key: value}` map edited as rows: react-final-form arrays need a list.
 */
export interface KeyValueRow {
  key: string;
  value: string;
}

export interface OfferingOption {
  uuid: string;
  name: string;
}

export interface ResourceOptionFormValues {
  choice_label: string;
  offering: OfferingOption | null;
  attribute_field_map: KeyValueRow[];
  default_attributes: KeyValueRow[];
}

export interface FieldMappingFormValues {
  question_id: string;
  proposal_field: ProposalFieldEnum | null;
  value_type: ValueTypeEnum;
}

export interface StepFormValues {
  key: string;
  survey_id: string;
  mapper: MapperEnum | '';
  is_reviewer_visible: boolean;
  resource_question_id: string;
  field_mappings: FieldMappingFormValues[];
  resource_options: ResourceOptionFormValues[];
}

export interface FlowFormValues {
  name: string;
  description: string;
  steps: StepFormValues[];
}

export const emptyStep = (): StepFormValues => ({
  key: '',
  survey_id: '',
  mapper: '',
  is_reviewer_visible: false,
  resource_question_id: '',
  field_mappings: [],
  resource_options: [],
});

export const emptyResourceOption = (): ResourceOptionFormValues => ({
  choice_label: '',
  offering: null,
  attribute_field_map: [],
  default_attributes: [],
});

const mapToRows = (map?: Record<string, unknown>): KeyValueRow[] =>
  Object.entries(map ?? {}).map(([key, value]) => ({
    key,
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));

const rowsToMap = (rows: KeyValueRow[] = []): Record<string, string> =>
  Object.fromEntries(
    rows.filter((row) => row.key).map((row) => [row.key, row.value ?? '']),
  );

export const flowToFormValues = (flow?: FormbricksFlow): FlowFormValues => {
  if (!flow) {
    return { name: '', description: '', steps: [emptyStep()] };
  }
  return {
    name: flow.name,
    description: flow.description ?? '',
    steps: flow.steps.map((step) => ({
      key: step.key,
      survey_id: step.survey_id,
      mapper: (step.mapper as MapperEnum) || '',
      is_reviewer_visible: Boolean(step.is_reviewer_visible),
      resource_question_id: step.resource_question_id ?? '',
      field_mappings: (step.field_mappings ?? []).map((mapping) => ({
        question_id: mapping.question_id,
        proposal_field: mapping.proposal_field,
        value_type: mapping.value_type ?? 'text',
      })),
      resource_options: (step.resource_options ?? []).map((option) => ({
        choice_label: option.choice_label,
        offering: { uuid: option.offering, name: option.offering_name },
        attribute_field_map: mapToRows(option.attribute_field_map),
        default_attributes: mapToRows(option.default_attributes),
      })),
    })),
  };
};

export const formValuesToPayload = (
  values: FlowFormValues,
): FormbricksFlowRequest => ({
  name: values.name,
  description: values.description ?? '',
  steps: (values.steps ?? []).map((step) => ({
    key: step.key,
    survey_id: step.survey_id,
    mapper: step.mapper || '',
    is_reviewer_visible: Boolean(step.is_reviewer_visible),
    resource_question_id: step.resource_question_id ?? '',
    field_mappings: (step.field_mappings ?? []).map((mapping) => ({
      question_id: mapping.question_id,
      proposal_field: mapping.proposal_field,
      value_type: mapping.value_type || 'text',
    })),
    resource_options: (step.resource_options ?? []).map((option) => ({
      choice_label: option.choice_label,
      offering: option.offering?.uuid,
      attribute_field_map: rowsToMap(option.attribute_field_map),
      default_attributes: rowsToMap(option.default_attributes),
    })),
  })),
});
