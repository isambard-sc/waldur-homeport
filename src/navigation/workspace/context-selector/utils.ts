import { getAbbreviation } from '@waldur/core/utils';

export const getItemAbbreviation = (item) => {
  if (typeof item !== 'object') {
    return item || '';
  }
  if (item.abbreviation) {
    return item.abbreviation.toUpperCase().substr(0, 4);
  } else if (item.name) {
    return getAbbreviation(item.name).substr(0, 4);
  } else if (item.customer_abbreviation) {
    return item.customer_abbreviation.toUpperCase().substr(0, 4);
  } else if (item.customer_name) {
    return item.customer_name.toUpperCase().substr(0, 4);
  }
  return '';
};
