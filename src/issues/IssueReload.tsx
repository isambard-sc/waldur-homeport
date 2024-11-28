import { ArrowsClockwise } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { issueAttachmentsGet } from '@waldur/issues/attachments/actions';
import { getIsLoading as getAttachmentsIsLoading } from '@waldur/issues/attachments/selectors';
import { issueCommentsGet } from '@waldur/issues/comments/actions';
import { getIsLoading as getCommentsIsLoading } from '@waldur/issues/comments/selectors';
import { type RootState } from '@waldur/store/reducers';
import './IssueReload.scss';

interface IssueReloadProps {
  issueUrl: string;
}

export const IssueReload: FunctionComponent<IssueReloadProps> = ({
  issueUrl,
}) => {
  const dispatch = useDispatch();

  // Combine loading states using useSelector
  const loading = useSelector(
    (state: RootState) =>
      getAttachmentsIsLoading(state) || getCommentsIsLoading(state),
  );

  // Combine fetch actions into a single callback
  const fetchData = () => {
    dispatch(issueAttachmentsGet(issueUrl));
    dispatch(issueCommentsGet(issueUrl));
  };

  return (
    <Tip label={translate('Reload issue data')} id="reload_issue_tooltip">
      <span className="issue-reload" onClick={fetchData} aria-hidden="true">
        <span
          className={`svg-icon svg-icon-2 ${loading ? 'animation-spin' : ''}`}
        >
          <ArrowsClockwise />
        </span>
      </span>
    </Tip>
  );
};
