import { UserDetails } from '@waldur/workspace/types';

export const USER_PROFILE_COMPLETION_FIELDS: Array<keyof UserDetails> = [
  'first_name',
  'last_name',
  'unix_username',
  'email',
  'job_title',
  'organization',
  'phone_number',
];

export const USER_PERMISSION_REQUESTS_TABLE_ID =
  'user-permission-requests-table';
export const USER_PERMISSION_REQUESTS_FILTER_FORM_ID =
  'user-permission-requests-table-filter-form';

export const USER_RESOURCES_FILTER_FORM_ID = 'AllResourcesFilter';

export const USER_REVIEWS_FILTER_FORM_ID = 'UserReviewsFilter';

export const CUSTOMERS_FILTER_FORM_ID = 'CustomersFilter';
