import { WarningCircleIcon } from '@phosphor-icons/react';
import React, { ReactNode, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import { ModalDialog } from './ModalDialog';
import { ConfirmationDialogType } from './types';

interface ConfirmationDialogProps {
  resolve: {
    deferred: {
      resolve: (value?: any) => void;
      reject: () => void;
    };
    title: ReactNode;
    body: ReactNode;
    nb?: ReactNode;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
    positiveButtonVariant?: string;
    onlyPositiveButton?: boolean;
    iconNode?: ReactNode;
    showInput?: boolean;
    inputRequired?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    inputMaxLength?: number;
    inputRows?: number;
    inputCheckboxes?: Array<{ label: string; value: string }>;
  };
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  resolve: {
    title,
    body,
    deferred,
    type = 'warning',
    positiveButton = translate('Yes'),
    negativeButton = translate('No'),
    positiveButtonVariant,
    onlyPositiveButton,
    iconNode,
    showInput = false,
    inputRequired = false,
    inputLabel,
    inputPlaceholder,
    inputMaxLength,
    inputRows,
    inputCheckboxes,
  },
}) => {
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog('HIDE_CONFIRM'));
  const [inputValue, setInputValue] = useState('');
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Set<string>>(
    new Set(),
  );

  const handleCheckboxChange = (value: string) => {
    setSelectedCheckboxes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (showInput && inputRequired && !inputValue.trim() && selectedCheckboxes.size === 0) {
      return;
    }

    let result: string;
    if (showInput) {
      const checkboxValues = Array.from(selectedCheckboxes).join(' | ');
      if (checkboxValues && inputValue.trim()) {
        result = `${checkboxValues} | ${inputValue.trim()}`;
      } else if (checkboxValues) {
        result = checkboxValues;
      } else {
        result = inputValue.trim();
      }
    }

    deferred.resolve(showInput ? result : undefined);
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <ModalDialog
      title={title}
      iconNode={iconNode || <WarningCircleIcon weight="bold" />}
      iconColor={type}
      bodyClassName="text-gray-500 pt-2"
      footer={
        <>
          {!onlyPositiveButton && (
            <Button
              variant="tertiary"
              className="flex-equal px-3"
              onClick={handleCancel}
            >
              {negativeButton}
            </Button>
          )}
          <Button
            variant={positiveButtonVariant}
            className={onlyPositiveButton ? undefined : 'flex-equal px-3'}
            onClick={handleSubmit}
            disabled={showInput && inputRequired && !inputValue.trim()}
          >
            {positiveButton}
          </Button>
        </>
      }
    >
      <div>
        {body}
        {showInput && (
          <div className="mt-3">
            {inputCheckboxes && inputCheckboxes.length > 0 && (
              <div className="mb-3">
                {inputCheckboxes.map((checkbox) => (
                  <Form.Check
                    key={checkbox.value}
                    type="checkbox"
                    id={`checkbox-${checkbox.value}`}
                    label={checkbox.label}
                    checked={selectedCheckboxes.has(checkbox.value)}
                    onChange={() => handleCheckboxChange(checkbox.value)}
                    className="mb-2"
                  />
                ))}
              </div>
            )}
            {inputRows ? (
              <TextField
                label={inputLabel}
                placeholder={inputPlaceholder}
                input={{
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
                }}
                required={inputRequired}
                maxLength={inputMaxLength}
                rows={inputRows}
              />
            ) : (
              <StringField
                label={inputLabel}
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required={inputRequired}
                maxLength={inputMaxLength}
              />
            )}
            {inputMaxLength && (
              <div className="text-muted small mt-1">
                {inputValue.length}/{inputMaxLength} {translate('characters')}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
