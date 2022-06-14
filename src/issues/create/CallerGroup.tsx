import { FunctionComponent } from 'react';
import { Button, ButtonGroup, Col, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { openUserPopover } from '@waldur/user/actions';

import { refreshUsers } from './api';
import { callerSelector } from './selectors';

const renderer = (option) => option.full_name || option.username;

const CallerActions = ({ onSearch }) => {
  const dispatch = useDispatch();
  const caller = useSelector(callerSelector);
  const onClick = () => dispatch(openUserPopover({ user: caller }));
  const filterByCaller = () => onSearch({ caller });
  if (!caller) {
    return null;
  }
  return (
    <Col sm={3}>
      <ButtonGroup>
        <Button onClick={onClick}>
          <i className="fa fa-eye" /> {translate('Details')}
        </Button>
        <Button onClick={filterByCaller}>
          <i className="fa fa-search" /> {translate('Filter')}
        </Button>
      </ButtonGroup>
    </Col>
  );
};

const filterOption = (options) => options;

export const CallerGroup: FunctionComponent<{ onSearch }> = ({ onSearch }) => (
  <Form.Group>
    <Col sm={3} as={Form.Label}>
      {translate('Caller')}
      <span className="text-danger">*</span>
    </Col>
    <Col sm={6}>
      <Field
        name="caller"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Select caller...')}
            loadOptions={refreshUsers}
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={renderer}
            value={fieldProps.input.value}
            required={true}
            onChange={(value) => fieldProps.input.onChange(value)}
            filterOption={filterOption}
            noOptionsMessage={() => translate('No organizations')}
            isClearable={true}
            additional={{
              page: 1,
            }}
          />
        )}
      />
    </Col>
    <CallerActions onSearch={onSearch} />
  </Form.Group>
);
