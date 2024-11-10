import { UploadSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { useUpdateUser } from './useUpdateUser';

interface OwnProps {
  user: UserDetails;
}

export const UserEditAvatarFormItem: React.FC<OwnProps> = ({ user }) => {
  const currentUser = useSelector(getUser);
  const [image, setImage] = useState(user.image);
  const { callback, isLoading } = useUpdateUser(user);

  return (
    <FormTable.Item
      label={translate('Avatar')}
      description={
        currentUser.uuid === user.uuid
          ? translate('Upload an image to personalize your account profile')
          : translate(
              "Upload an image to personalize the user's account profile",
            )
      }
      value={
        <WideImageField
          name="image"
          alt={getItemAbbreviation(user, 'full_name')}
          initialValue={user.image}
          max={2 * 1024 * 1024} // 2MB
          size={65}
          input={{ value: image, onChange: (value) => setImage(value) } as any}
          extraActions={({ isChanged, isTooLarge }) =>
            isChanged || isLoading ? (
              <Button
                variant="primary"
                size="sm"
                className="btn-icon-right"
                disabled={isLoading || isTooLarge}
                onClick={() => callback({ image })}
              >
                {translate('Save')}
                <span className="svg-icon svg-icon-5">
                  <UploadSimple />
                </span>
              </Button>
            ) : null
          }
        />
      }
    />
  );
};
