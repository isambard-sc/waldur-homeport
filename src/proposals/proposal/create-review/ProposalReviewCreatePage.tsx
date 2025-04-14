import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { createRef, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  proposalProposalsRetrieve,
  proposalReviewsPartialUpdate,
  proposalReviewsRetrieve,
  proposalReviewsSubmit,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getUUID } from '@waldur/core/utils';
import { Form } from '@waldur/form/Form';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import {
  closeModalDialog,
  openModalDialog,
  waitForConfirmation,
} from '@waldur/modal/actions';
import { useTitle } from '@waldur/navigation/title';
import { PROPOSAL_UPDATE_REVIEW_FORM_ID } from '@waldur/proposals/constants';
import { ProposalReview } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { CreatePageSidebar } from './CreatePageSidebar';
import { ReviewHeader } from './ReviewHeader';
import { createReviewSteps } from './steps/steps';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

const loadData = async (reviewUuid: string) => {
  const review = (await proposalReviewsRetrieve({
    path: { uuid: reviewUuid },
  }).then((response) => response.data)) as ProposalReview;
  const proposal = await proposalProposalsRetrieve({
    path: { uuid: getUUID(review.proposal) },
  }).then((response) => response.data);
  return { review, proposal };
};

export const ProposalReviewCreatePage = (props) => {
  useTitle(translate('Create review'));

  const {
    params: { review_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();
  const user = useSelector(getUser);

  // We keep the Review object here, so that we don't fetch it again every time a comment is added/edited.
  // See the "openCommentFormDialog" function.
  const [reviewObject, setReviewObject] = useState<ProposalReview>(null);

  const { data, isLoading, error, refetch } = useQuery(
    ['ReviewData', review_uuid],
    () => loadData(review_uuid),
    {
      refetchOnWindowFocus: false,
      onSuccess(data) {
        setReviewObject(data.review);
      },
    },
  );

  const formSteps = createReviewSteps;

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const dispatch = useDispatch();

  const submit = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirm your review'),
        translate(
          'Are you sure you want to submit this review for the {name} proposal?',
          {
            name: <b>{data.proposal.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await proposalReviewsSubmit({
        path: { uuid: data.review.uuid },
      });
      dispatch(
        showSuccess(translate('Proposal review submitted successfully')),
      );
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Something went wrong')));
    }
  }, [data, router, user]);

  const openCommentFormDialog = useCallback(
    ({ commentField, label }) =>
      dispatch(
        openModalDialog(CommentFormDialog, {
          resolve: {
            title: label,
            value: reviewObject[commentField],
            onSubmit: async (formData) => {
              try {
                const res = await proposalReviewsPartialUpdate({
                  path: { uuid: data.review.uuid },
                  body: { [commentField]: formData.comment },
                });
                setReviewObject(res.data);
                dispatch(closeModalDialog());
              } catch (error) {
                dispatch(
                  showErrorResponse(error, translate('Something went wrong')),
                );
              }
            },
          },
          size: 'sm',
        }),
      ),
    [dispatch, data, setReviewObject, reviewObject],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <PageBarProvider scrollOffset={100}>
      <Form form={PROPOSAL_UPDATE_REVIEW_FORM_ID} onSubmit={submit}>
        {({ submitting }) => (
          <>
            <SidebarLayout.Header className="pb-5">
              <div className="w-100">
                <ReviewHeader review={data.review} />
              </div>
            </SidebarLayout.Header>
            <SidebarLayout.Container>
              <SidebarLayout.Body>
                {formSteps.map((step, i) => (
                  <div ref={stepRefs.current[i]} key={step.id}>
                    <step.component
                      id={step.id}
                      title={step.label}
                      change={props.change}
                      params={{
                        proposal: data.proposal,
                        reviews: reviewObject ? [reviewObject] : [],
                        onAddCommentClick: openCommentFormDialog,
                        readOnly: true,
                      }}
                    />
                  </div>
                ))}
              </SidebarLayout.Body>
              <SidebarLayout.Sidebar transparent>
                <CreatePageSidebar
                  review={reviewObject}
                  submitting={submitting}
                  refetch={refetch}
                />
              </SidebarLayout.Sidebar>
            </SidebarLayout.Container>
          </>
        )}
      </Form>
    </PageBarProvider>
  );
};
