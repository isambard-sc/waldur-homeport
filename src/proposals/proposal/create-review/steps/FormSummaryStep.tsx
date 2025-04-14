import { Star } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import ReactStars from 'react-rating-stars-component';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';
import {
  ProposalReview,
  proposalReviewsPartialUpdate,
  ReviewSubmitRequest,
} from 'waldur-js-client';

import {
  RATING_STAR_ACTIVE_COLOR,
  RATING_STAR_INACTIVE_COLOR,
} from '@waldur/core/constants';
import { Panel } from '@waldur/core/Panel';
import { Tip } from '@waldur/core/Tooltip';
import { FormGroup, TextField, FieldError } from '@waldur/form';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { REVIEW_SUMMARY_FORM_ID } from '@waldur/proposals/constants';
import { isReviewInFinalState } from '@waldur/proposals/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

type FormSummaryStepProps = VStepperFormStepProps &
  InjectedFormProps<ReviewSubmitRequest, VStepperFormStepProps>;

const FormSummaryStep: React.FC<FormSummaryStepProps> = (props) => {
  const { handleSubmit, params } = props;

  const review: ProposalReview = params.reviews?.[0];

  useEffect(() => {
    props.initialize({
      summary_score: review?.summary_score,
      summary_public_comment: review?.summary_public_comment,
      summary_private_comment: review?.summary_private_comment,
    });
  }, [params]);

  const dispatch = useDispatch();

  const updateReview = async (formData: ReviewSubmitRequest) => {
    try {
      await proposalReviewsPartialUpdate({
        body: formData,
        path: { uuid: review?.uuid },
      });
      dispatch(showSuccess(translate('Review has been updated.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to update review.')));
    }
  };

  // Disable the button if the review is not in "in_review" or "created" state
  const disabled = isReviewInFinalState(review?.state);

  const Btn = (
    <Button disabled={disabled} onClick={handleSubmit(updateReview)}>
      {translate('Save summary')}
    </Button>
  );

  return (
    <Panel title={props.title} id={props.id} cardBordered>
      <Field
        name="summary_score"
        component={(fieldProps) => (
          <FormGroup {...fieldProps} label={translate('Rate')}>
            <div className="d-flex align-items-center gap-4">
              <ReactStars
                count={5}
                size={20}
                edit={true}
                isHalf={false}
                emptyIcon={<Star weight="fill" />}
                filledIcon={<Star weight="fill" />}
                color={RATING_STAR_INACTIVE_COLOR}
                activeColor={RATING_STAR_ACTIVE_COLOR}
                value={fieldProps.input.value || 0}
                onChange={(value) => fieldProps.input.onChange(value)}
              />
              <span className="text-gray-700 mt-2">
                {fieldProps.input.value === 1
                  ? translate('1 star')
                  : translate('{count} stars', {
                      count: fieldProps.input.value,
                    })}
              </span>
            </div>
          </FormGroup>
        )}
      />
      <Field
        name="summary_public_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Comments')}
        placeholder={translate('Add your comment here')}
      >
        <TextField />
      </Field>
      <Field
        name="summary_private_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Notes (not visible to user)')}
        placeholder={translate('Add your notes here')}
      >
        <TextField />
      </Field>
      {disabled ? (
        <Tip
          label={
            <FieldError
              error={translate('Reviews in final states are not editable')}
            />
          }
          id="save-summary-button-errors"
        >
          {Btn}
        </Tip>
      ) : (
        Btn
      )}
    </Panel>
  );
};

export default reduxForm<ReviewSubmitRequest, VStepperFormStepProps>({
  form: REVIEW_SUMMARY_FORM_ID,
  enableReinitialize: false,
})(FormSummaryStep);
