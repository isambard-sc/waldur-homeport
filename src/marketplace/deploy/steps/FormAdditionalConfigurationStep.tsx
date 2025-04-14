import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Tip } from '@waldur/core/Tooltip';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';

import { FormStepProps } from '../types';
import { formCustomerSelector } from '../utils';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => {
  const customer = useSelector(formCustomerSelector);
  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
      <AccordionCard
        title={props.title}
        id={props.id}
        className={classNames('step-card', props.disabled && 'step-disabled')}
        defaultOpen
      >
        {props.disabled && <div className="step-blocker" />}
        <OptionsForm options={props.offering.options} customer={customer} />
      </AccordionCard>
    </Tip>
  );
};
