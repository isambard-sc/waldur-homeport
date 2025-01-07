import { Offering } from '@waldur/marketplace/types';

export interface CustomerCredit {
  expected_consumption: number;
  grace_coefficient: number;
  apply_as_minimal_consumption: boolean;
  uuid: string;
  url: string;
  customer: string;
  customer_name: string;
  customer_uuid: string;
  end_date: string;
  minimal_consumption: string; // number
  minimal_consumption_logic: 'fixed' | 'linear';
  consumption_last_month: number;
  offerings: Pick<Offering, 'uuid' | 'name' | 'type' | 'url'>[];
  value: string; // number
  allocated_to_projects: number;
}

export interface CustomerCreditFormData {
  expected_consumption: string;
  value: string;
  customer: string;
  offerings: string[];
  end_date: string;
  minimal_consumption_logic: 'fixed' | 'linear';
}

export interface ProjectCredit {
  uuid: string;
  url: string;
  project: string;
  project_name: string;
  offerings: Pick<Offering, 'uuid' | 'name' | 'type' | 'url'>[];
  value: string; // number
  consumption_last_month: number;
}

export interface ProjectCreditFormData {
  value: string;
  project: string;
}
