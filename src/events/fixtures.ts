import { Event } from './types';

export const event: Event = {
  uuid: 'uuid',
  event_type: 'auth_logged_in_with_username',
  context: {
    user_uuid: 'a45c8927e176455781f63e7c7baf9567',
    user_username: 'alice',
    user_full_name: 'Alice Lebowski',
    ip_address: '8.8.8.8',
  },
  created: '2018-01-05T04:47:04.982Z',
  message:
    'User alice with full name Alice Lebowski authenticated successfully with username and password.',
};
