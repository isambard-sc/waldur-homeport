import { CustomerCredit } from '@waldur/customer/credits/types';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { BasePermission } from '@waldur/permissions/types';
import { Quota } from '@waldur/quotas/types';

interface Permission {
  project_uuid?: string;
  user_uuid: string;
  role: string;
  created: string;
  expiration_time?: string;
  created_by_username: string;
  created_by_full_name?: string;
}

export interface User {
  permissions?: BasePermission[];
  image?: string;
  is_staff: boolean;
  is_support: boolean;
  url: string;
  uuid: string;
  short_name: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
  organization?: string;
  unix_username: string;
}

export interface UserDetails extends User {
  token_lifetime?: number;
  native_name?: string;
  civil_number: string;
  phone_number: string;
  email: string;
  image?: string;
  requested_email?: string;
  registration_method: string;
  preferred_language: string;
  date_joined: string;
  organization: string;
  job_title: string;
  description?: string;
  affiliations?: string[];
  token: string;
  agreement_date: string;
  is_active: boolean;
  identity_provider_name?: string;
  identity_provider_label?: string;
  identity_provider_management_url?: string;
  identity_provider_fields?: string[];
  slug?: string;
}

interface PaymentProfileAttributes {
  end_date: string;
  agreement_number: string;
  contract_sum: number;
}

export interface PaymentProfile {
  is_active: boolean;
  name: string;
  payment_type: string;
  payment_type_display: string;
  organization_uuid: string;
  url: string;
  attributes: PaymentProfileAttributes;
  uuid: string;
}

export interface Payment {
  date_of_payment: string;
  sum: string;
  proof: string;
  uuid: string;
  invoice_uuid?: string;
  invoice_period?: string;
  customer_uuid?: string;
}

interface BillingPriceEstimate {
  total: string;
  current: string;
  tax: string;
  tax_current: string;
}

export interface Project {
  slug?: string;
  name: string;
  uuid: string;
  short_name: string;
  url: string;
  permissions: Permission[];
  quotas: Quota[];
  description?: string;
  created?: string;
  start_date?: string;
  end_date?: string;
  billing_price_estimate?: BillingPriceEstimate;
  project_credit?: number;
  customer_uuid?: string;
  customer_name?: string;
  customer_abbreviation?: string;
  backend_id?: string;
  image?: string;
  oecd_fos_2007_code?: string;
  oecd_fos_2007_label?: string;
  type?: string;
  marketplace_resource_count?: object;
  resources_count?: number;
  is_industry?: boolean;
}

export type PhoneNumber =
  | string
  | {
      national_number: string;
      country_code: string;
    };

// Customer has only two mandatory fields: name and email, rest are optional.
export interface Customer {
  slug?: string;
  projects_count?: number;
  url?: string;
  uuid?: string;
  email: string;
  name: string;
  display_name?: string;
  abbreviation?: string;
  access_subnets?: string;
  accounting_start_date?: string;
  address?: string;
  agreement_number?: string;
  sponsor_number?: string;
  bank_account?: string;
  bank_name?: string;
  contact_details?: string;
  country_name?: string;
  country?: string;
  credit?: CustomerCredit;
  default_tax_percent?: string;
  native_name?: string;
  phone_number?: PhoneNumber;
  postal?: string;
  registration_code?: string;
  domain?: string;
  homepage?: string;
  vat_code?: string;
  image?: string;
  call_managing_organization_uuid?: string;
  is_service_provider?: boolean;
  created?: string;
  organization_groups?: OrganizationGroup[];
  latitude?: number;
  longitude?: number;
  customer_credit?: number;
  billing_price_estimate?: BillingPriceEstimate;
  projects?: Project[];
  payment_profiles?: PaymentProfile[];
  users_count?: number;
}

export interface WorkspaceState {
  user: User;
  impersonatorUser: User;
  customer?: Customer;
  project?: Project;
  resource?;
}
