import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DotsSixVerticalIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import { FormbricksSurvey, formbricksSurveysList } from 'waldur-js-client';

import { AlertItem, BaseButton, Switch } from 'waldur-ui';

import { required } from '@/core/validators';
import { SelectField, StringField } from '@/form';
import { translate } from '@/i18n';

/** A step as the editor holds it. `isNew` steps take their key from their
 * label; a saved step keeps its key, which its answers are stored under. */
export interface StepValue {
  key: string;
  label: string;
  survey_id: string | null;
  reviewer_visible: boolean;
  isNew?: boolean;
}

/** A step key from its label, as Django's slugify makes it. */
export const slugify = (text: string): string =>
  (text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[-\s]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

/**
 * Every step's key: a saved step's own, a new one's from its label, made
 * unique with -2, -3... where two labels slug alike.
 */
export const stepKeys = (steps: StepValue[]): string[] => {
  const taken = new Set(
    steps.filter((step) => !step.isNew).map((step) => step.key),
  );
  return steps.map((step) => {
    if (!step.isNew) return step.key;
    const base = slugify(step.label) || 'form';
    let key = base;
    for (let n = 2; taken.has(key); n++) {
      key = `${base}-${n}`;
    }
    taken.add(key);
    return key;
  });
};

const surveyLabel = (survey: FormbricksSurvey) => survey.name;

/**
 * The surveys to choose from, with a step's saved survey kept as an option
 * when Formbricks no longer lists it (deleted, or the list failed to load),
 * so the step still shows which survey it names.
 */
const withSaved = (
  surveys: FormbricksSurvey[],
  surveyId: string | null | undefined,
): FormbricksSurvey[] =>
  !surveyId || surveys.some((survey) => survey.id === surveyId)
    ? surveys
    : [
        ...surveys,
        {
          id: surveyId,
          name: translate('{id} (not found in Formbricks)', { id: surveyId }),
          type: '',
          status: translate('unknown'),
          environment_id: '',
          question_count: 0,
          updated_at: '',
          used_by_flows: [],
        },
      ];

const SurveyOption = ({ survey }: { survey: FormbricksSurvey }) => (
  <div>
    <div>{survey.name}</div>
    <div className="text-muted fs-7">
      {translate('{status}, {count} questions', {
        status: survey.status,
        count: survey.question_count,
      })}
      {survey.used_by_flows.length > 0 &&
        ` · ${translate('in {flows}', {
          flows: survey.used_by_flows.join(', '),
        })}`}
    </div>
  </div>
);

interface StepRowProps {
  name: string;
  id: string;
  stepKey: string;
  surveys: FormbricksSurvey[];
  onRemove(): void;
  canRemove: boolean;
  onSurveyChosen(survey: FormbricksSurvey | null): void;
}

const StepRow: FC<StepRowProps> = ({
  name,
  id,
  stepKey,
  surveys,
  onRemove,
  canRemove,
  onSurveyChosen,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, animateLayoutChanges: () => false });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="d-flex gap-3 align-items-start border rounded p-3 mb-3 bg-body"
      data-testid="form-flow-step"
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={`border-0 bg-transparent p-1 mt-1 text-muted ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label={translate('Drag to reorder')}
      >
        <DotsSixVerticalIcon size={20} weight="bold" />
      </button>
      <div className="flex-grow-1 d-flex flex-column gap-3">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor={`${name}.survey_id`}>
              {translate('Survey')}
            </label>
            <Field name={`${name}.survey_id`} validate={required}>
              {({ input, meta }) => (
                <SelectField
                  input={input}
                  meta={meta}
                  options={surveys}
                  simpleValue
                  getOptionValue={(survey: FormbricksSurvey) => survey.id}
                  getOptionLabel={surveyLabel}
                  formatOptionLabel={(survey: FormbricksSurvey, { context }) =>
                    context === 'menu' ? (
                      <SurveyOption survey={survey} />
                    ) : (
                      surveyLabel(survey)
                    )
                  }
                  placeholder={translate('Choose a survey')}
                  noOptionsMessage={() =>
                    translate('No surveys in this Formbricks environment.')
                  }
                  onChange={(survey: FormbricksSurvey | null) =>
                    onSurveyChosen(survey)
                  }
                />
              )}
            </Field>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor={`${name}.label`}>
              {translate('Label')}
            </label>
            <Field name={`${name}.label`} validate={required}>
              {({ input, meta }) => (
                <StringField
                  input={{ ...input, id: `${name}.label` }}
                  meta={meta}
                  placeholder={translate(
                    'What applicants see, e.g. Compliance',
                  )}
                />
              )}
            </Field>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <Field name={`${name}.reviewer_visible`} type="checkbox">
            {({ input }) => (
              <Switch
                size="sm"
                checked={Boolean(input.checked)}
                onCheckedChange={input.onChange}
                label={translate('Reviewers may read')}
              />
            )}
          </Field>
          <span className="text-muted fs-7">
            {translate('Key: {key}', { key: stepKey || '–' })}
          </span>
        </div>
      </div>
      <BaseButton
        onClick={onRemove}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-danger"
        aria-label={translate('Remove step')}
        disabled={!canRemove}
        disabledReason={translate('A flow has at least one step.')}
      />
    </li>
  );
};

const StepsList = ({
  fields,
  surveys,
}: FieldArrayRenderProps<StepValue, HTMLElement> & {
  surveys: FormbricksSurvey[];
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const steps = fields.value ?? [];
  const keys = stepKeys(steps);
  const ids = fields.map((_, index) => String(index));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      fields.move(Number(active.id), Number(over.id));
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol className="list-unstyled mb-0" aria-label={translate('Steps')}>
            {fields.map((name, index) => (
              <StepRow
                key={ids[index]}
                id={ids[index]}
                name={name}
                stepKey={keys[index]}
                surveys={withSaved(surveys, steps[index]?.survey_id)}
                canRemove={fields.length > 1}
                onRemove={() => fields.remove(index)}
                onSurveyChosen={(survey) => {
                  // A new step's label starts as its survey's name.
                  const step = steps[index];
                  if (survey && step && !step.label) {
                    fields.update(index, {
                      ...step,
                      survey_id: survey.id,
                      label: survey.name,
                    });
                  }
                }}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <BaseButton
        onClick={() =>
          fields.push({
            key: '',
            label: '',
            survey_id: null,
            reviewer_visible: true,
            isNew: true,
          })
        }
        label={translate('Add step')}
        iconNode={<PlusIcon weight="bold" />}
        variant="text-primary"
        size="sm"
      />
    </>
  );
};

/**
 * A flow's steps, in the order applicants see them: each a Formbricks survey
 * from the site's environment, a label, and whether reviewers may read it.
 */
export const FormFlowStepsField = () => {
  const {
    data: surveys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['FormbricksSurveys'],
    queryFn: () => formbricksSurveysList().then((response) => response.data),
    meta: { skipGlobalErrorRedirect: true },
    refetchOnWindowFocus: false,
  });

  return (
    <div className="mb-5">
      <div className="form-label fw-bold">{translate('Steps')}</div>
      <p className="text-muted fs-7">
        {translate(
          'The forms applicants fill in beside the proposal form, in this order. Drag a step to move it.',
        )}
      </p>
      {error ? (
        <AlertItem
          variant="warning"
          className="mb-3"
          title={translate('Unable to list the surveys in Formbricks.')}
          body={translate(
            'Check the Formbricks connection. Steps already saved keep their surveys.',
          )}
        />
      ) : null}
      <FieldArray<StepValue>
        name="steps"
        render={(props) => (
          <StepsList {...props} surveys={isLoading ? [] : (surveys ?? [])} />
        )}
      />
    </div>
  );
};
