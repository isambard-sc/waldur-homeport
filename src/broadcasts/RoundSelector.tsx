import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { Select } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { callAutocomplete, roundAutocomplete } from './autocomplete';

const PROPOSAL_STATES = [
  { value: 'draft', label: translate('Draft') },
  { value: 'submitted', label: translate('Submitted') },
  { value: 'in_review', label: translate('In review') },
  { value: 'accepted', label: translate('Accepted') },
  { value: 'rejected', label: translate('Rejected') },
  { value: 'canceled', label: translate('Canceled') },
];

export const RoundSelector = () => {
  const { values } = useFormState();
  const form = useForm();
  const [showStateDialog, setShowStateDialog] = useState(false);

  const handleRoundChange = (newRound) => {
    if (newRound) {
      setShowStateDialog(true);
      form.change('round', newRound);
      // Set default proposal states to submitted and in_review
      if (!values?.proposal_states || values.proposal_states.length === 0) {
        form.change('proposal_states', ['submitted', 'in_review']);
      }
    } else {
      form.change('round', null);
      form.change('proposal_states', null);
    }
  };

  const handleCallChange = (newCall) => {
    form.change('round_call', newCall);
    // Clear round selection when call changes
    form.change('round', null);
    form.change('proposal_states', null);
  };

  const handleStateDialogClose = () => {
    setShowStateDialog(false);
  };

  const handleStateChange = (state) => {
    const currentStates = values?.proposal_states || [];
    if (currentStates.includes(state)) {
      form.change(
        'proposal_states',
        currentStates.filter((s) => s !== state),
      );
    } else {
      form.change('proposal_states', [...currentStates, state]);
    }
  };

  return (
    <>
      <FormGroup
        label={translate('Call')}
        help={translate('Select a call to filter rounds')}
      >
        <Field
          name="round_call"
          component={Select as any}
          placeholder={translate('Select call...')}
          loadOptions={(query, prevOptions, page) =>
            callAutocomplete(query, prevOptions, page)
          }
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          noOptionsMessage={() => translate('No calls found')}
          isClearable={true}
          onChange={(value) => handleCallChange(value)}
        />
      </FormGroup>

      <FormGroup
        label={translate('Rounds')}
        help={translate(
          'Select a round to message team members of proposals in that round',
        )}
      >
        <Field
          name="round"
          key={values?.round_call?.uuid || 'no-call'}
          component={Select as any}
          placeholder={
            values?.round_call
              ? translate('Select round...')
              : translate('Select a call first...')
          }
          loadOptions={(query, prevOptions, page) =>
            values?.round_call
              ? roundAutocomplete(
                  values.round_call.uuid,
                  query,
                  prevOptions,
                  page,
                )
              : Promise.resolve({ options: [], hasMore: false })
          }
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          noOptionsMessage={() => translate('No rounds found')}
          isClearable={true}
          isDisabled={!values?.round_call}
          onChange={(value) => handleRoundChange(value)}
        />
      </FormGroup>

      {values?.round && (
        <div className="mb-4">
          <Button
            variant="link"
            className="p-0"
            onClick={() => setShowStateDialog(true)}
          >
            {translate('Configure proposal states')}{' '}
            {values?.proposal_states && values.proposal_states.length > 0
              ? `(${values.proposal_states.length} selected)`
              : ''}
          </Button>
        </div>
      )}

      <Modal show={showStateDialog} onHide={handleStateDialogClose}>
        <Modal.Header closeButton>
          <Modal.Title>{translate('Select proposal states')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {translate(
              'Choose which proposal states to include when messaging team members:',
            )}
          </p>
          {PROPOSAL_STATES.map((state) => (
            <div key={state.value} className="mb-2">
              <AwesomeCheckboxField
                label={state.label}
                hideLabel={false}
                input={{
                  value: values?.proposal_states?.includes(state.value),
                  onChange: () => handleStateChange(state.value),
                }}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleStateDialogClose}>
            {translate('Done')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
