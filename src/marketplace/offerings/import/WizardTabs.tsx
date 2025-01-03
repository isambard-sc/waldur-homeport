import { ComponentType, createElement, FC } from 'react';

import { ProgressStep } from '@waldur/core/ProgressSteps';

interface WizardTabsProps {
  steps: ProgressStep[];
  currentStep: ProgressStep;
  tabs: Record<string, ComponentType<any>>;
  mountOnEnter?: boolean;
}

export const WizardTabs: FC<WizardTabsProps> = ({
  steps,
  currentStep,
  tabs,
  mountOnEnter,
}) => (
  <>
    {steps.map((step) => (
      <div
        key={step.key}
        className={step.key === currentStep.key ? undefined : 'hidden'}
      >
        {mountOnEnter
          ? step === currentStep
            ? createElement(tabs[step.key])
            : null
          : createElement(tabs[step.key], {
              isVisible: step === currentStep,
            })}
      </div>
    ))}
  </>
);
