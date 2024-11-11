import { Eye } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';
import { getProviderOfferingGLAuthConfig } from '@waldur/marketplace/common/api';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const GLAuthConfigDialog = lazyComponent(
  () => import('./GLAuthConfigDialog'),
  'GLAuthConfigDialog',
);

export const GLAuthConfigButton: FC<{
  offering;
}> = ({ offering }) => {
  const enabled =
    offering.secret_options?.service_provider_can_create_offering_user;
  const { data, error, isLoading, refetch } = useQuery(
    ['OfferingGLAuthConfig', offering.uuid, enabled],
    () => (enabled ? getProviderOfferingGLAuthConfig(offering.uuid) : null),
    { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  );

  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(GLAuthConfigDialog, {
        resolve: { offering, config: data },
        size: 'lg',
      }),
    );
  };
  return error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <ActionButton
      action={callback}
      title={translate('View GLAuth configuration')}
      iconNode={enabled && data && <Eye />}
      pending={isLoading}
      disabled={!enabled}
      tooltip={
        !enabled &&
        translate(
          '"Service provider can create offering user" must be enabled for GLAuth generation',
        )
      }
    />
  );
};
