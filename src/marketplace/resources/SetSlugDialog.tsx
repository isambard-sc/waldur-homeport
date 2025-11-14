import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesSetSlug } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { DeploymentFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SetSlugDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  const slugsImmutable =
    isFeatureVisible(DeploymentFeatures.make_slugs_immutable) &&
    !!resource.slug;

  return (
    <ResourceActionDialog
      dialogTitle={translate('Set slug')}
      formFields={[
        {
          name: 'slug',
          label: translate('Slug'),
          required: true,
          type: 'string',
          disabled: slugsImmutable,
          help_text: slugsImmutable
            ? translate('Slug cannot be changed once set.')
            : translate(
                'Warning: Changing the slug may break external integrations that rely on this value. Ensure that all dependent systems are updated before proceeding.',
              ),
        },
      ]}
      initialValues={{
        slug: resource.slug,
      }}
      submitForm={async (formData) => {
        try {
          await marketplaceResourcesSetSlug({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('Slug has been successfully set.')));
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to set slug.')));
        }
      }}
    />
  );
};
