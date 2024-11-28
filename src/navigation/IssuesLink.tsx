import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { getUser } from '@waldur/workspace/selectors';

const QuickIssueContainer = lazyComponent(() =>
  import('../navigation/header/quick-issue-drawer/QuickIssueContainer').then(
    (module) => ({ default: module.QuickIssueContainer }),
  ),
);

export const IssuesLink: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const showIssues = useSelector(hasSupport);

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(QuickIssueContainer, {
        title: translate('Issues'),
      }),
    );
  };

  return showIssues && user ? (
    <span className="menu-link px-2">
      <span className="menu-title" aria-hidden="true" onClick={openDrawer}>
        {translate('Issues')}
      </span>
    </span>
  ) : null;
};
