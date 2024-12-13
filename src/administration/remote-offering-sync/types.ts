export interface RemoteSyncCategoryRule {
  /** UUID of remote category */
  remote_category: string;
  remote_category_name?: string;
  /** URL of local category */
  local_category: string;
  local_category_name?: string;
  local_category_uuid?: string;
}

export interface RemoteSyncForm {
  api_url: string;
  token: string;
  remote_organization_uuid: string;
  remote_organization_name: string;
  /** URL of local service provider */
  local_service_provider: string;
  remotelocalcategory_set: RemoteSyncCategoryRule[];
  is_active: boolean;
}

export interface RemoteSync extends RemoteSyncForm {
  uuid: string;
  url: string;
  last_execution: string;
  last_output: string;
  get_state_display: 'OK' | 'Active' | 'Scheduled';
  error_message: string;
  created: string;
  modified: string;
  local_service_provider_name: string;
}

export interface RemoteSyncActionProps {
  row: RemoteSync;
  refetch;
}
