import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { issueCommentsGet } from '@waldur/issues/comments/actions';
import { getIsLoading as getCommentsIsLoading } from '@waldur/issues/comments/selectors';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

interface ReloadCommentsProps {
  issueUrl: string;
}

export const ReloadComments: FC<ReloadCommentsProps> = ({ issueUrl }) => {
  const dispatch = useDispatch();

  const loading = useSelector(getCommentsIsLoading);

  const fetchData = () => {
    dispatch(issueCommentsGet(issueUrl));
  };

  return <RefreshButton refetch={fetchData} loading={loading} />;
};
