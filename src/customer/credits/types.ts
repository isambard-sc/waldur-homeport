import { Offering } from '@waldur/marketplace/types';

interface BaseCredit {
  expected_consumption: number;
  grace_coefficient: number;
  apply_as_minimal_consumption: boolean;
  uuid: string;
  url: string;
  end_date: string;
  minimal_consumption: string; // number
  minimal_consumption_logic: 'fixed' | 'linear';
  consumption_last_month: number;
  offerings: Pick<Offering, 'uuid' | 'name' | 'type' | 'url'>[];
  value: string; // number
}

export interface CustomerCredit extends BaseCredit {
  customer: string;
  customer_name: string;
  customer_uuid: string;
  allocated_to_projects: number;
}

export interface BaseCreditFormData {
  expected_consumption: string;
  value: string;
  end_date: string;
  minimal_consumption_logic: 'fixed' | 'linear';
}

export interface CustomerCreditFormData extends BaseCreditFormData {
  customer: string;
  offerings: string[];
}

export interface ProjectCredit extends BaseCredit {
  project: string;
  project_name: string;
}

export interface ProjectCreditFormData extends BaseCreditFormData {
  project: string;
}
