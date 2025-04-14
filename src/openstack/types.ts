export interface Quota {
  name: string;
  limit: number;
  usage: number;
  limitType?: string;
  required?: number;
}

export type EthernetType = 'IPv4' | 'IPv6';

export type SecurityGroupDirection = 'ingress' | 'egress';

export type SecurityGroupProtocol = 'tcp' | 'udp' | 'icmp' | '' | null | 'any';
