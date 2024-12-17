import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';

import * as actions from './actions';
import { getIsDeleting } from './selectors';
import { Attachment } from './types';

interface IssueAttachmentProps {
  attachment: Attachment;
}

export const IssueAttachment: FunctionComponent<IssueAttachmentProps> = ({
  attachment,
}) => {
  const isDeleting = useSelector((state) =>
    getIsDeleting(state, { attachment }),
  );
  const dispatch = useDispatch();
  const deleteAttachment = () =>
    dispatch(actions.issueAttachmentsDelete(attachment.uuid));

  return (
    <AttachmentItem
      attachment={attachment}
      onDelete={deleteAttachment}
      isDeleting={isDeleting}
    />
  );
};
