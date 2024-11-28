export interface OIDCConfig {
  auth_url: string;
  client_id: string;
  discovery_url: string;
  enable_pkce: boolean;
  enable_post_logout_redirect: boolean;
  is_active: boolean;
  label: string;
  logout_url: string;
  management_url: string;
  protected_fields: string[];
  provider: string;
  token_url: string;
  userinfo_url: string;
  verify_ssl: boolean;
}
