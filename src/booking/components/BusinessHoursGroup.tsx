import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { Select } from '@waldur/form/themed-select';
import { getOptions } from '@waldur/form/TimeSelectField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface BusinessHoursGroupProps {
  startTime: string;
  endTime: string;
  setStartTime(value: string): void;
  setEndTime(value: string): void;
}

export const BusinessHoursGroup: FunctionComponent<BusinessHoursGroupProps> = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => (
  <FormGroup
    label={translate('Business hours')}
    description={translate('Daily available booking time range')}
  >
    <Form.Label className="col-xs-2" htmlFor="react-select-startTime--value">
      <i className="fa fa-clock-o" />
    </Form.Label>
    <Select
      instanceId="startTime"
      className="col-xs-4"
      name="startTime"
      isSearchable={false}
      isClearable={false}
      isMulti={false}
      options={getOptions(60)}
      value={getOptions(60).filter(({ value }) => value === startTime)}
      onChange={(option: any) => setStartTime(option.value)}
    />
    <Form.Label className="col-xs-2" htmlFor="react-select-endTime--value">
      {translate('till')}
    </Form.Label>
    <Select
      instanceId="endTime"
      name="endTime"
      className="col-xs-4"
      isSearchable={false}
      isClearable={false}
      isMulti={false}
      options={[...getOptions(60), { value: '24:00', label: '24:00' }]}
      value={[...getOptions(60), { value: '24:00', label: '24:00' }].filter(
        ({ value }) => value === endTime,
      )}
      onChange={(option: any) => setEndTime(option.value)}
    />
  </FormGroup>
);
