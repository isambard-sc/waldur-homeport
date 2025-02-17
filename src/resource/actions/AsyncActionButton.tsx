import { AxiosResponse } from 'axios';
import { ReactElement, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface AsyncActionButtonProps<T> {
  apiMethod(id: string): Promise<AxiosResponse>;
  resource: T;
  validators?: ActionValidator<T>[];
  title: string;
  icon?: string;
  iconNode?: ReactNode;
  className?: string;
  refetch?(): void;
}

export const AsyncActionButton: <T extends { uuid: string }>(
  props: AsyncActionButtonProps<T>,
) => ReactElement = ({ resource, apiMethod, validators, refetch, ...rest }) => {
  const validationState = useValidators(validators, resource);
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await apiMethod(resource.uuid);
      if (refetch) {
        refetch();
      }
      dispatch(showSuccess(translate('Action has been applied.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to apply action.')));
    }
  };
  return <ActionButton {...rest} {...validationState} action={callback} />;
};
