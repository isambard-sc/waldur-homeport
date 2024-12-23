import { Category, Offering } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

export interface OfferingImportFormData {
  api_url: string;
  token: string;
  customer: Customer;
  offerings: Offering[];
  categories_set: Array<{ remote_category: string; local_category: Category }>;
}
