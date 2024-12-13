import { PlusCircle, Trash } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { usePagination } from '@waldur/core/usePagination';
import { required, requiredArray } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { categoryAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { TablePagination } from '@waldur/table/TablePagination';

interface FieldValue {
  remote_category?;
  local_category?;
}

const FieldsListGroup = ({
  fields,
  remoteCategories,
}: FieldArrayRenderProps<FieldValue, HTMLElement> & { remoteCategories }) => {
  const {
    page,
    setPage,
    pageSize,
    changePageSize,
    visibleItems,
    refreshPageOnAdd,
    refreshPageOnRemove,
    hasPages,
  } = usePagination(fields);

  const addDisabled = fields.value?.some(
    (v) => !v.remote_category || !v.local_category,
  );

  const addRow = () => {
    if (!addDisabled) {
      fields.push({});
      refreshPageOnAdd();
    }
  };

  const removeRow = (index) => {
    fields.length > 1 && fields.remove(index);
    refreshPageOnRemove();
  };

  return (
    <div id="category-mapping-rules">
      <Form.Group>
        <table className="table table-row-bordered border-bottom mb-3">
          <thead>
            <tr>
              <td className="w-50">{translate('Remote category')}</td>
              <td className="w-50">{translate('Local category')}</td>
              <td className="w-70px">{translate('Actions')}</td>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((component, i) =>
              component ? (
                <Fragment key={component}>
                  <tr>
                    <td>
                      <Field
                        component={SelectField}
                        name={`${component}.remote_category`}
                        options={remoteCategories}
                        getOptionValue={(option) => option.uuid}
                        getOptionLabel={(option) => option.title}
                        validate={required}
                      />
                    </td>
                    <td>
                      <Field
                        name={`${component}.local_category`}
                        validate={required}
                      >
                        {(fieldProps) => (
                          <AsyncPaginate
                            loadOptions={categoryAutocomplete}
                            defaultOptions
                            getOptionValue={(option) => option.url}
                            getOptionLabel={(option) => option.title}
                            value={fieldProps.input.value}
                            onChange={(value) =>
                              fieldProps.input.onChange(value)
                            }
                            noOptionsMessage={() => translate('No categories')}
                            className="metronic-select-container"
                            classNamePrefix="metronic-select"
                          />
                        )}
                      </Field>
                    </td>
                    <td>
                      <Button
                        variant="active-light-danger"
                        className="btn-icon btn-icon-danger"
                        onClick={() => removeRow(i)}
                        disabled={fields.length < 2}
                      >
                        <span className="svg-icon svg-icon-1">
                          <Trash weight="bold" />
                        </span>
                      </Button>
                    </td>
                  </tr>
                </Fragment>
              ) : null,
            )}
          </tbody>
        </table>
      </Form.Group>
      <div>
        <Button
          variant="active-secondary"
          className="btn-text-primary btn-icon-primary"
          onClick={addRow}
          disabled={addDisabled}
        >
          <span className="svg-icon svg-icon-2">
            <PlusCircle weight="bold" />
          </span>{' '}
          {translate('Add new')}
        </Button>
      </div>

      <TablePagination
        currentPage={page}
        pageSize={pageSize}
        resultCount={fields.length}
        hasRows={hasPages}
        showPageSizeSelector
        updatePageSize={changePageSize}
        gotoPage={setPage}
      />
    </div>
  );
};

export const CategoryMappingRulesField = ({ remoteCategories }) => (
  <FieldArray
    name="remotelocalcategory_set"
    component={FieldsListGroup}
    rerenderOnEveryChange
    validate={requiredArray}
    remoteCategories={remoteCategories}
  />
);
