import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FormAbstractVolumeFields } from '@waldur/openstack/openstack-instance/deploy/FormAbstractVolumeFields';

export const FormVolumeStep = (props: FormStepProps) => (
  <VStepperFormStepCard
    title={translate('Volume')}
    id={props.id}
    disabled={props.disabled}
    disabledTooltip={props.disabledTooltip}
  >
    <FormAbstractVolumeFields
      typeField="attributes.type"
      sizeField="attributes.size"
      title={translate('Volume')}
      optional={false}
      {...props}
    />
  </VStepperFormStepCard>
);
