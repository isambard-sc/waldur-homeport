import { useMemo } from 'react';

import { ActionValidator } from '@waldur/resource/actions/types';
import { parseValidators } from '@waldur/resource/actions/utils';
import { useUser } from '@waldur/workspace/hooks';

export const useValidators: <T>(
  validators: ActionValidator<T>[],
  resource: T,
) => { tooltip: string; disabled: boolean } = (validators, resource) => {
  const user = useUser();
  return useMemo(() => {
    const tooltip = parseValidators(validators, { user, resource });
    const disabled = tooltip !== undefined;
    return { tooltip, disabled };
  }, [validators, resource, user]);
};
