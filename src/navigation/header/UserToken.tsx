import { Copy } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

export const UserToken = ({ token }) => {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(token).then(() => {
      dispatch(showSuccess(translate('Token has been copied')));
    });
  }, [dispatch, token]);

  return (
    <div className="menu-item px-5" data-kt-menu-trigger="click">
      <div className="px-5 menu-link">
        <span className="menu-title me-2 text-nowrap">
          {translate('API token')}
        </span>
        <InputGroup>
          <FormControl
            value={token}
            readOnly={true}
            className="form-control-solid h-30px"
            size="sm"
            placeholder={translate('Token')}
            style={{
              fontFamily: 'text-security-disc',
            }}
          />
          <Button
            variant="primary"
            size="sm"
            className="px-3"
            onClick={onClick}
          >
            <Copy />
            {translate('Copy')}
          </Button>
        </InputGroup>
      </div>
    </div>
  );
};
