import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FormSSHPublicKeysField } from '@waldur/openstack/openstack-instance/deploy/FormSSHPublicKeysField';

export const FormSSHPublicKeysStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('SSH public keys')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <FormSSHPublicKeysField change={props.change} />
    </VStepperFormStepCard>
  );
};
