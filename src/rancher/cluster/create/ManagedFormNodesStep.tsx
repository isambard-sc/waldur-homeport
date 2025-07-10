import { debounce } from 'lodash-es';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { BoxNumberField } from '@waldur/form/BoxNumberField';
import { FilterBox } from '@waldur/form/FilterBox';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Offering } from '@waldur/marketplace/types';
import { FlavorTable } from '@waldur/openstack/openstack-instance/deploy/FlavorTable';
import { FormAbstractVolumeFields } from '@waldur/openstack/openstack-instance/deploy/FormAbstractVolumeFields';

import { LonghornWorkerWarning } from './LonghornWorkerWarning';

export const ManagedFormNodesStep = (props: FormStepProps) => {
  const openstackOffering: Offering = useSelector((state) =>
    orderFormSelector(state, 'attributes.openstack_offering'),
  );

  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(value);
      props.change('attributes.worker_nodes_flavor', null);
    }, 1000),
    [],
  );

  return (
    <VStepperFormStepCard
      title={translate('Worker nodes hardware configuration')}
      id={props.id}
      disabled={!openstackOffering || props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        <div className="ms-auto">
          <FilterBox
            type="search"
            placeholder={translate('Search')}
            onChange={(e) => applyQuery(e.target.value)}
          />
        </div>
      }
    >
      <div className="mb-2 border-bottom">
        <FormGroup label={translate('Number of nodes')} required={true}>
          <Field
            name="attributes.worker_nodes_count"
            component={BoxNumberField}
            min={1}
            validate={[required]}
            parse={parseIntField}
            format={formatIntField}
          />
        </FormGroup>
      </div>
      {openstackOffering ? (
        <>
          <div className="mb-2 border-bottom">
            <FlavorTable
              offering={openstackOffering}
              query={query}
              fieldName="attributes.worker_nodes_flavor"
            />
            <LonghornWorkerWarning />
          </div>
          <div className="mt-4">
            <FormAbstractVolumeFields
              {...props}
              offering={openstackOffering}
              typeTitle={translate('Data volume type')}
              sizeTitle={translate('Data volume size (GB)')}
              helpText={translate('Detachable and resizable data disk')}
              typeField="attributes.worker_nodes_data_volume_type_name"
              sizeField="attributes.worker_nodes_data_volume_size"
              hideQuotas
            />
          </div>
        </>
      ) : null}
    </VStepperFormStepCard>
  );
};
