import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { issueAttachmentsGet } from '@waldur/issues/attachments/actions';
import { getIsLoading as getAttachmentsIsLoading } from '@waldur/issues/attachments/selectors';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

interface ReloadAttachmentsProps {
  issueUrl: string;
}

export const ReloadAttachments: FC<ReloadAttachmentsProps> = ({ issueUrl }) => {
  const dispatch = useDispatch();

  const loading = useSelector(getAttachmentsIsLoading);

  const fetchData = () => {
    dispatch(issueAttachmentsGet(issueUrl));
  };

  return <RefreshButton refetch={fetchData} loading={loading} />;
};
