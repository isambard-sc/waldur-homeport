import { FunnelSimple } from '@phosphor-icons/react';
import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { ComponentType, FC, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useBoolean } from 'react-use';
import { Field, getFormValues } from 'redux-form';

import { InfiniteList } from '@waldur/core/InfiniteList';
import { isEmpty } from '@waldur/core/utils';
import { FilterBox } from '@waldur/form/FilterBox';
import { Form } from '@waldur/form/Form';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { HeaderButtonBullet } from '../HeaderButtonBullet';

import { FilterSelect } from './FilterSelect';

const FILTERS_FORM_ID = 'BreadcrumbsFiltersForm';

interface DataPage {
  data: any[];
  nextPage?: number;
}

const loadData: QueryFunction<DataPage> = async (context) => {
  const response = await parseResponse(
    context.meta.api as any,
    {
      page: context.pageParam,
      ...(context.meta.params as any),
    },
    { signal: context.signal },
  );
  return {
    data: response.rows,
    nextPage: response.nextPage,
  };
};

interface BreadcrumbDropdownProps {
  api: string;
  RowComponent: ComponentType<{ row }>;
  queryField: string;
  params?: Record<string, any>;
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value; label }>;
  }>;
  emptyMessage?: string;
  placeholder?: string;
}

export const BreadcrumbDropdown: FC<BreadcrumbDropdownProps> = ({
  api,
  queryField,
  RowComponent,
  params = {},
  filters,
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search'),
}) => {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useBoolean(false);

  const formValues = useSelector((state) => {
    const values = getFormValues(FILTERS_FORM_ID)(state);
    return Object.keys(values || {}).reduce((acc, key) => {
      if (values[key]?.length) {
        acc[key] = values[key].map((option) => option.value);
      }
      return acc;
    }, {});
  });

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(String(value).trim());
    }, 1000),
    [setQuery],
  );

  const context = useInfiniteQuery<any, any, DataPage>(
    ['SearchBoxResults', api, params, query, formValues],
    loadData,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      meta: { api, params: { ...params, [queryField]: query, ...formValues } },
      refetchOnWindowFocus: false,
      useErrorBoundary: false,
      retry: false,
      onError: () => {
        /* Catch error to prevent showing error boundary view */
      },
    },
  );

  return (
    <div>
      <div className="d-flex border-bottom py-2 pe-3">
        <FilterBox
          type="search"
          placeholder={placeholder}
          onChange={(e) => applyQuery(e.target.value)}
          inputClassName="border-0 shadow-none"
          className="flex-grow-1"
        />
        {Boolean(filters) && (
          <Button
            variant="outline-default"
            className="btn-outline btn-icon btn-toggle-filters position-relative"
            onClick={setFilterOpen}
          >
            <span className="svg-icon svg-icon-1">
              <FunnelSimple weight="bold" />
            </span>
            {!isEmpty(formValues) && (
              <HeaderButtonBullet size={8} blink={false} className="me-n2" />
            )}
          </Button>
        )}
      </div>
      {filterOpen && (
        <Form
          form={FILTERS_FORM_ID}
          destroyOnUnmount={false}
          className="d-flex border-bottom py-1 px-5"
        >
          {filters.map((filter) => (
            <Field
              key={filter.field}
              name={filter.field}
              component={(fieldProps) => (
                <FilterSelect
                  placeholder={filter.label}
                  options={filter.options}
                  {...fieldProps}
                />
              )}
            />
          ))}
        </Form>
      )}
      <div className="mh-300px overflow-auto">
        <InfiniteList
          RowComponent={RowComponent}
          context={context}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
};
