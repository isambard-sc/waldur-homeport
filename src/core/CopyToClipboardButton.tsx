import { Copy } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

interface OwnProps {
  value;
  size?: number;
  className?;
}

export const CopyToClipboardButton: FunctionComponent<OwnProps> = ({
  value,
  className,
  size,
}) => {
  const dispatch = useDispatch();

  const onClick = useCallback(
    (event) => {
      event.stopPropagation();
      navigator.clipboard.writeText(value).then(() => {
        dispatch(showSuccess(translate('Text has been copied')));
      });
    },
    [dispatch, value],
  );

  return (
    <p className={classNames('my-1', className)}>
      <button className="text-btn" type="button" onClick={(e) => onClick(e)}>
        <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
          <Copy size={size} />
        </Tip>
      </button>
    </p>
  );
};
