export interface UsageReport {
  customer_name: string;
  customer_uuid: string;
  project_name: string;
  project_uuid: string;
  offering_name: string;
  offering_uuid: string;
  resource_name: string;
  name: string;
  created: string;
  date: string;
  usage: number;
  measured_unit: string;
  description?: string;
}

export interface UsageReportRequest {
  billing_period?: string;
  customer_uuid?: string;
  project_uuid?: string;
  offering_uuid?: string;
}

export interface UsageReportContext {
  resource_uuid: string;
  resource_name: string;
  offering_uuid: string;
  customer_name?: string;
  project_name?: string;
  backend_id?: string;
}

export interface ComponentUsage {
  name: string;
  type: string;
  measured_unit: string;
  usage: number;
  date: string;
  description: string;
  billing_period: string;
  recurring: boolean;
}

export interface ComponentUserUsage {
  uuid: string;
  user: string; // url
  username: string;
  component_usage: string; // url
  measured_unit: string;
  usage: number;
  component_type: string;
  date: string;
  billing_period?: string;
  description: string;
  backend_id: string;
  resource_name: string;
  resource_uuid: string;
  offering_name: string;
  offering_uuid: string;
  project_name: string;
  project_uuid: string;
  customer_name: string;
  customer_uuid: string;
  created: string;
  modified: string;
}

export interface ResourcePlanPeriod {
  uuid: string;
  plan_name: string;
  plan_uuid: string;
  start: string;
  end: string;
  components: ComponentUsage[];
}
