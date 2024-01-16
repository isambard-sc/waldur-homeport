import './WizardStepIndicator.scss';

export const WizardStepIndicator = ({ steps, activeStep, onSelect }) => (
  <ol className="wizard-step-indicator">
    {steps.map((step, stepIndex) => (
      <li
        key={stepIndex}
        className={activeStep === stepIndex ? 'active' : undefined}
        onClick={() => onSelect(stepIndex)}
      >
        <div className="step">
          {stepIndex < activeStep ? (
            <i className="fa fa-check" />
          ) : (
            stepIndex + 1
          )}
        </div>{' '}
        <div className="caption hidden-xs hidden-sm">{step}</div>
      </li>
    ))}
  </ol>
);
