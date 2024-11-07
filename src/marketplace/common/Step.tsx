import { CheckCircle } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

interface StepProps {
  active?: boolean;
  complete?: boolean;
  title: string;
  onClick?(): void;
  disabled?: boolean;
}

export const Step: FC<StepProps> = ({
  active = false,
  complete = false,
  disabled,
  title,
  onClick,
}) => (
  <button
    className={classNames('step', {
      active,
      disabled,
    })}
    type="button"
    onClick={() => onClick()}
  >
    <h4 className="step-title">
      {complete && (
        <span className="svg-icon svg-icon-2">
          <CheckCircle />
        </span>
      )}{' '}
      {title}
    </h4>
  </button>
);
