import { useDispatch } from 'react-redux';

import { formatMediumDateTime } from '@waldur/core/dateUtils';
import { getAbbreviation } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { openUserPopover } from '@waldur/user/actions';

const nameToColor = (name: string) => {
  const colors = ['primary', 'success', 'info', 'warning', 'danger'];
  const hash = hashStr(name);
  const index = hash % colors.length;
  return colors[index] || 'primary';
};

const hashStr = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

export const CommentHeader = ({ comment }) => {
  const dispatch = useDispatch();

  const openUserDialog = () => {
    dispatch(openUserPopover({ user_uuid: comment.author_uuid }));
  };

  const color = nameToColor(comment.author_name);

  return (
    <div className="d-flex align-items-center f">
      <div className="symbol symbol-50px me-5">
        <div
          className={`symbol-label fs-1 fw-bold bg-light-${color} text-${color}`}
        >
          {getAbbreviation(comment.author_name)}
        </div>
      </div>
      <div className="d-flex flex-column fw-semibold fs-5 text-gray-600 text-dark">
        <div className="d-flex align-items-center">
          <button
            onClick={openUserDialog}
            type="button"
            className="text-btn text-gray-800 fw-bold text-hover-primary fs-5 me-3"
          >
            {comment.author_name}
          </button>
          <span className="m-0" />
        </div>
        <span className="text-muted fw-semibold fs-6">
          {formatMediumDateTime(comment.created)}
        </span>
        {!comment.is_public && (
          <span className="label label-default text-uppercase">
            {translate('Internal')}
          </span>
        )}
      </div>
    </div>
  );
};
