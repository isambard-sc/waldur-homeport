export type PolicyPeriod = 1 | 2 | 3 | 4;

export interface CostPolicyFormData {
  limit_cost: number;
  project_credit?: number;
  scope: string;
  actions: string;
  period: PolicyPeriod;
  options?:
    | {
        notify_external_user?: string;
      }
    | string;
}

export type CostPolicyType = 'project' | 'organization';
