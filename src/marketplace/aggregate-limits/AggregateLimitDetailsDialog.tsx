import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse } from '@waldur/store/notify';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { PublicResourceLink } from '../resources/list/PublicResourceLink';
import { NON_TERMINATED_STATES } from '../resources/list/ResourceStateFilter';

import { AggregateLimitsExpandableRow } from './AggregateLimitsExpandableRow';
import { getMarketplaceResources } from './api';

const requiredFields = ['name', 'current_usages', 'limits', 'uuid'];

export const AggregateLimitDetailsDialog = ({
  resolve: { project, customer, components },
}) => {
  const dispatch = useDispatch();
  const initialComponent = components?.[0] || null;
  const [selectedComponentType, setSelectedComponentType] =
    useState(initialComponent);
  const [allRows, setAllRows] = useState([]);

  const fetchData = async (component) => {
    if (!component) return;

    const filter = {
      project_uuid: project?.uuid,
      customer_uuid: customer?.uuid,
      state: NON_TERMINATED_STATES.map((option) => option.value),
      field: requiredFields,
      offering_uuid: component.offering_uuid,
    };

    try {
      const response = await getMarketplaceResources(filter);
      setAllRows(response || []);
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to load resource data.')),
      );
    }
  };

  useEffect(() => {
    fetchData(selectedComponentType);
  }, [project, customer, selectedComponentType]);

  const handleChange = (value) => {
    const selected = components.find(
      (component) => component.type === value.value,
    );
    setSelectedComponentType(selected || null);
  };

  const getComponentOptions = () => {
    if (!components) return [];

    return components.map((component) => ({
      value: component.type,
      label: component.name,
    }));
  };

  const tableProps = useTable({
    table: 'aggregateLimitDetailsDialog',
    fetchData: () =>
      Promise.resolve({
        rows: allRows,
        resultCount: allRows.length,
      }),
  });

  const columns = [
    {
      title: translate('Name'),
      render: PublicResourceLink,
      copyField: (row) => row.name,
    },
    {
      title: translate('Usage'),
      render: ({ row }) =>
        row.current_usages?.[selectedComponentType?.type] || DASH_ESCAPE_CODE,
    },
    {
      title: translate('Limit'),
      render: ({ row }) =>
        row.limits?.[selectedComponentType?.type] || DASH_ESCAPE_CODE,
    },
  ];

  const renderExpandableRow = () => {
    const componentData = components.find(
      (component) => component.type === selectedComponentType?.type,
    );
    return <AggregateLimitsExpandableRow data={componentData || {}} />;
  };

  return (
    <ModalDialog
      title={translate('Usage and limits details for {object}', {
        object: project?.name || customer.name,
      })}
      closeButton
    >
      <div className="row d-flex justify-content-end">
        <div className="col-md-4">
          <Select
            placeholder={translate('Select component')}
            className="mb-2 w-100"
            value={
              selectedComponentType
                ? {
                    value: selectedComponentType.type,
                    label: selectedComponentType.name,
                  }
                : null
            }
            onChange={handleChange}
            options={getComponentOptions()}
            isClearable={false}
          />
        </div>
      </div>

      <Table
        {...tableProps}
        rows={allRows}
        columns={columns}
        verboseName={translate('Resources')}
        expandableRow={renderExpandableRow}
      />
    </ModalDialog>
  );
};
