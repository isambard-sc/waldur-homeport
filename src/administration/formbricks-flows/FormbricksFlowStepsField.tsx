import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { FormbricksFlowChoices } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  BooleanGroup,
  SelectGroup,
  StringGroup,
} from '@/form';
import { translate } from '@/i18n';
import { publicOfferingsAutocomplete } from '@/marketplace/common/autocompletes';

import { emptyResourceOption, emptyStep, OfferingOption } from './utils';

const loadOfferings = publicOfferingsAutocomplete();

const RemoveButton: FC<{ onClick(): void; tooltip: string }> = ({
  onClick,
  tooltip,
}) => (
  <BaseButton
    iconNode={<TrashIcon weight="bold" />}
    tooltip={tooltip}
    onClick={onClick}
    variant="danger"
    size="sm"
  />
);

const AddButton: FC<{ onClick(): void; label: string }> = ({
  onClick,
  label,
}) => (
  <BaseButton
    iconNode={<PlusCircleIcon weight="bold" />}
    label={label}
    onClick={onClick}
    variant="tertiary"
    size="sm"
  />
);

/** Edits a `{key: value}` map as rows. */
const KeyValueRowsField: FC<{
  name: string;
  label: string;
  keyLabel: string;
  valueLabel: string;
}> = ({ name, label, keyLabel, valueLabel }) => (
  <FieldArray name={name}>
    {({ fields }) => (
      <div className="mb-3">
        <div className="fw-semibold mb-2">{label}</div>
        {fields.map((rowName, index) => (
          <div className="row align-items-end" key={rowName}>
            <div className="col-sm-5">
              <StringGroup name={`${rowName}.key`} label={keyLabel} />
            </div>
            <div className="col-sm-5">
              <StringGroup name={`${rowName}.value`} label={valueLabel} />
            </div>
            <div className="col-sm-2 mb-7">
              <RemoveButton
                tooltip={translate('Remove')}
                onClick={() => fields.remove(index)}
              />
            </div>
          </div>
        ))}
        <AddButton
          label={translate('Add')}
          onClick={() => fields.push({ key: '', value: '' })}
        />
      </div>
    )}
  </FieldArray>
);

const FieldMappingsField: FC<{
  name: string;
  choices: FormbricksFlowChoices;
}> = ({ name, choices }) => (
  <FieldArray name={name}>
    {({ fields }) => (
      <div className="mb-5">
        <div className="fw-semibold mb-2">{translate('Field mappings')}</div>
        <div className="text-muted small mb-2">
          {translate(
            'Copy a Formbricks answer into a proposal field. Formbricks sends every answer as text; the value type says how to convert it.',
          )}
        </div>
        {fields.map((rowName, index) => (
          <div className="row align-items-end" key={rowName}>
            <div className="col-sm-4">
              <StringGroup
                name={`${rowName}.question_id`}
                label={translate('Question ID')}
                required
                validate={required}
              />
            </div>
            <div className="col-sm-4">
              <SelectGroup
                name={`${rowName}.proposal_field`}
                label={translate('Proposal field')}
                options={choices.proposal_fields}
                simpleValue
                isClearable={false}
                required
                validate={required}
              />
            </div>
            <div className="col-sm-3">
              <SelectGroup
                name={`${rowName}.value_type`}
                label={translate('Value type')}
                options={choices.value_types}
                simpleValue
                isClearable={false}
              />
            </div>
            <div className="col-sm-1 mb-7">
              <RemoveButton
                tooltip={translate('Remove mapping')}
                onClick={() => fields.remove(index)}
              />
            </div>
          </div>
        ))}
        <AddButton
          label={translate('Add mapping')}
          onClick={() =>
            fields.push({
              question_id: '',
              proposal_field: null,
              value_type: 'text',
            })
          }
        />
      </div>
    )}
  </FieldArray>
);

const ResourceOptionsField: FC<{ name: string }> = ({ name }) => (
  <FieldArray name={name}>
    {({ fields }) => (
      <div className="mb-5">
        <div className="fw-semibold mb-2">{translate('Resource options')}</div>
        <div className="text-muted small mb-2">
          {translate(
            "Map each choice of the resource question onto an offering. The call must request that offering for the applicant's choice to become a resource request.",
          )}
        </div>
        {fields.map((rowName, index) => (
          <div className="border rounded p-4 mb-3" key={rowName}>
            <div className="row align-items-end">
              <div className="col-sm-5">
                <StringGroup
                  name={`${rowName}.choice_label`}
                  label={translate('Choice label')}
                  description={translate(
                    'Exactly as the choice is labelled in Formbricks.',
                  )}
                  required
                  validate={required}
                />
              </div>
              <div className="col-sm-6">
                <AsyncSelectGroup
                  name={`${rowName}.offering`}
                  label={translate('Offering')}
                  required
                  validate={required}
                  loadOptions={loadOfferings}
                  getOptionValue={(option: OfferingOption) => option.uuid}
                  getOptionLabel={(option: OfferingOption) => option.name}
                  noOptionsMessage={() => translate('No offerings')}
                />
              </div>
              <div className="col-sm-1 mb-7">
                <RemoveButton
                  tooltip={translate('Remove resource')}
                  onClick={() => fields.remove(index)}
                />
              </div>
            </div>
            <KeyValueRowsField
              name={`${rowName}.attribute_field_map`}
              label={translate('Answers copied into resource attributes')}
              keyLabel={translate('Question ID')}
              valueLabel={translate('Attribute')}
            />
            <KeyValueRowsField
              name={`${rowName}.default_attributes`}
              label={translate('Default attributes')}
              keyLabel={translate('Attribute')}
              valueLabel={translate('Value')}
            />
          </div>
        ))}
        <AddButton
          label={translate('Add resource')}
          onClick={() => fields.push(emptyResourceOption())}
        />
      </div>
    )}
  </FieldArray>
);

export const FormbricksFlowStepsField: FC<{
  choices: FormbricksFlowChoices;
}> = ({ choices }) => (
  <FieldArray name="steps">
    {({ fields }) => (
      <>
        {fields.map((name, index) => (
          <div className="border rounded p-5 mb-5" key={name}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="mb-0">
                {translate('Step {number}', { number: index + 1 })}
              </h5>
              <div className="d-flex gap-2">
                <BaseButton
                  iconNode={<ArrowUpIcon weight="bold" />}
                  tooltip={
                    index === 0
                      ? translate('This is already the first step')
                      : translate('Move up')
                  }
                  disabled={index === 0}
                  onClick={() => fields.move(index, index - 1)}
                  variant="tertiary"
                  size="sm"
                />
                <BaseButton
                  iconNode={<ArrowDownIcon weight="bold" />}
                  tooltip={
                    index === fields.length - 1
                      ? translate('This is already the last step')
                      : translate('Move down')
                  }
                  disabled={index === fields.length - 1}
                  onClick={() => fields.move(index, index + 1)}
                  variant="tertiary"
                  size="sm"
                />
                <RemoveButton
                  tooltip={translate('Remove step')}
                  onClick={() => fields.remove(index)}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <StringGroup
                  name={`${name}.key`}
                  label={translate('Step key')}
                  description={translate(
                    "Stable identifier, e.g. project_details. Used in the survey's redirect ending as current_step.",
                  )}
                  required
                  validate={required}
                />
              </div>
              <div className="col-sm-6">
                <StringGroup
                  name={`${name}.survey_id`}
                  label={translate('Formbricks survey ID')}
                  required
                  validate={required}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <SelectGroup
                  name={`${name}.mapper`}
                  label={translate('Mapper')}
                  description={translate(
                    'Applies field mappings and resource options to the proposal. Without one, answers are only stored for reading.',
                  )}
                  options={[
                    {
                      value: '',
                      label: translate('None (store answers only)'),
                    },
                    ...choices.mappers,
                  ]}
                  simpleValue
                  isClearable={false}
                />
              </div>
              <div className="col-sm-6">
                <StringGroup
                  name={`${name}.resource_question_id`}
                  label={translate('Resource question ID')}
                  description={translate(
                    'Formbricks question ID of the resource multi-select. Required when the step has resource options.',
                  )}
                />
              </div>
            </div>
            <BooleanGroup
              name={`${name}.is_reviewer_visible`}
              label={translate('Visible to reviewers')}
            />
            <FieldMappingsField
              name={`${name}.field_mappings`}
              choices={choices}
            />
            <ResourceOptionsField name={`${name}.resource_options`} />
          </div>
        ))}
        <AddButton
          label={translate('Add step')}
          onClick={() => fields.push(emptyStep())}
        />
      </>
    )}
  </FieldArray>
);
