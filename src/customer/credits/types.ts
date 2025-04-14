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

export interface ProjectCreditFormData extends BaseCreditFormData {
  project: string;
}
