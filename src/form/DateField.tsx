import { X } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import Flatpickr from 'react-flatpickr';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const DateField: FunctionComponent<any> = (props) => (
  <>
    <Flatpickr
      options={{
        dateFormat: 'Y-m-d',
        minDate: props.minDate,
        maxDate: props.maxDate,
        defaultDate: props.defaultDate,
        monthSelectorType: 'static',
      }}
      value={
        props.input.value && typeof props.input.value === 'string'
          ? DateTime.fromISO(props.input.value).toJSDate()
          : props.defaultDate
      }
      onChange={(value) =>
        props.input.onChange(
          value[0] instanceof Date
            ? DateTime.fromJSDate(value[0]).toISODate()
            : value[0],
        )
      }
      className={
        props.solid ? 'form-control form-control-solid' : 'form-control'
      }
    />
    {props.input.value && typeof props.input.value === 'string' && (
      <button
        type="button"
        className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow end-button"
        onClick={() => props.input.onChange(null)}
      >
        <Tip
          id="date-input-remove"
          label={translate('Remove')}
          className="w-100"
        >
          <span className="svg-icon svg-icon-2">
            <X weight="bold" />
          </span>
        </Tip>
      </button>
    )}
  </>
);
