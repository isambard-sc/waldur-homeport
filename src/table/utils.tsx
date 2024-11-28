import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n/translate';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const getId = (row, index) => {
  if (row.uuid) {
    return row.uuid;
  } else if (row.pk) {
    return row.pk;
  }
  return index;
};

export const formatLongText = (value) =>
  value && value.length > 100 ? (
    <Tip label={value} id="longText">
      <span className="ellipsis d-inline-block" style={{ width: 150 }}>
        {value}
      </span>
    </Tip>
  ) : (
    value
  );

export const transformRows = (rows: any[]) => {
  const entities: object = {};
  const order: any[] = [];
  rows.forEach((row, index) => {
    entities[getId(row, index)] = row;
    order.push(getId(row, index));
  });
  return { entities, order };
};

export const renderFieldOrDash = (field) => (field ? field : DASH_ESCAPE_CODE);

export function getNoResultMessage({ query, verboseName }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
    query: query,
  };
  if (query) {
    return translate(
      'Your search "{query}" did not match any {verboseName}.',
      context,
    );
  } else {
    return translate('There are no {verboseName} yet.', context);
  }
}

export function getNoResultTitle({ verboseName }) {
  const context = {
    verboseName: String(verboseName || translate('Items')).toLowerCase(),
  };
  return translate('No {verboseName} found', context);
}

export const getFiltersFormId = (filters: JSX.Element) => {
  if (!filters) return '';
  return filters.props?.form;
};

export const getSavedFiltersKey = (table, formId) =>
  `waldur/table/filters/${table}/${formId}`;
