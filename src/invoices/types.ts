import { ServiceProvider } from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

export interface InvoiceItem {
  uuid: string;
  article_code: string;
  tax: string;
  total: string;
  name: string;
  details: any;
  start: string;
  end: string;
  unit: string;
  measured_unit: string;
  unit_price: string;
  price: string;
  factor: number;
  quantity?: number;
  project_uuid?: string;
  project_name?: string;
  resource?: string;
  resource_name?: string;
  resource_uuid?: string;
}

export interface Invoice {
  uuid: string;
  number: string;
  customer: string;
  customer_details: Customer;
  issuer_details: Customer;
  due_date: string;
  invoice_date: string;
  period: string;
  price: string;
  tax: any;
  total: any;
  items: InvoiceItem[];
  year: number;
  month: number;
  url: string;
  payment_url?: string;
  state: 'pending' | 'created' | 'paid' | 'canceled';
}

export interface InvoiceTableItem {
  resource_name: string;
  resource_uuid: string;
  project_name: string;
  project_uuid: string;
  service_provider_name: string;
  service_provider_uuid: string;
  plan_name: string;
  total: 0;
  items: InvoiceItem[];
}

export interface InvoiceItemsFilterData {
  provider: ServiceProvider;
  project: Project;
}
