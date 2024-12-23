import { useState } from 'react';

import { ProgressStep } from '@waldur/core/ProgressSteps';

export const useWizard = (steps: ProgressStep[]) => {
  const [step, setStep] = useState<ProgressStep>(() => steps[0]);
  const goBack = () => setStep(steps[steps.indexOf(step) - 1]);
  const goNext = () => setStep(steps[steps.indexOf(step) + 1]);
  const isFirstStep = step === steps[0];
  const isLastStep = step === steps[steps.length - 1];
  return { step, setStep, goBack, goNext, isFirstStep, isLastStep };
};
