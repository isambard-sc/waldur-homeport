import { FixedIP } from '@waldur/resource/types';

export interface Quota {
  name: string;
  limit: number;
  usage: number;
  limitType?: string;
  required?: number;
}

export interface VolumeType {
  url: string;
  name: string;
  description: string;
  is_default: boolean;
}

export interface ServerGroupType {
  url: string;
  uuid: string;
  name: string;
  settings: string;
  policy: string;
  resource_type?: string;
  tenant?: string;
}

export type EthernetType = 'IPv4' | 'IPv6';

export type SecurityGroupDirection = 'ingress' | 'egress';

export type SecurityGroupProtocol = 'tcp' | 'udp' | 'icmp' | '' | null | 'any';

export interface SecurityGroupRule {
  ethertype: EthernetType;
  direction: SecurityGroupDirection;
  id: number;
  protocol: SecurityGroupProtocol;
  from_port?: number;
  to_port?: number;
  port_range?: { min: number; max: number };
  cidr: string;
  remote_group?: string;
  remote_group_name?: string;
  remote_group_uuid?: string;
  description?: string;
}

export interface Port {
  uuid: string;
  url?: string;
  fixed_ips?: FixedIP[];
  allowed_address_pairs?: any;
  mac_address?: string;
  network_name: string;
  network_uuid: string;
}
