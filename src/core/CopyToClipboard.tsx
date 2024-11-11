import { Copy } from '@phosphor-icons/react';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

interface CopyToClipboardProps {
  value;
  className?: string;
  label?: string;
  textButton?: boolean;
}

export const CopyToClipboard: FunctionComponent<CopyToClipboardProps> = ({
  value,
  label = translate('Copy to clipboard'),
  className,
  textButton,
}) => {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    copy(value);
    dispatch(showSuccess(translate('Value has been copied')));
  }, [dispatch, value]);

  return textButton ? (
    <button
      className={classNames('text-btn', className)}
      type="button"
      onClick={onClick}
    >
      <Copy /> {label}
    </button>
  ) : (
    <button
      className={classNames('btn', className)}
      type="button"
      onClick={onClick}
    >
      <span className="svg-icon svg-icon-2">
        <Copy />
      </span>
      {label}
    </button>
  );
};
