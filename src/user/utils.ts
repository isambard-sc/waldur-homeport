const ROLE_COLORS = {
  'CALL.MANAGER': 'pink',
  'CALL.REVIEWER': 'blue',
  'CUSTOMER.CALL_ORGANIZER': 'primary',
  'CUSTOMER.MANAGER': 'pink',
  'CUSTOMER.OWNER': 'primary',
  'CUSTOMER.READER': 'teal',
  'CUSTOMER.SUPPORT': 'warning',
  'OFFERING.MANAGER': 'pink',
  'PROJECT.ADMIN': 'primary',
  'PROJECT.MANAGER': 'pink',
  'PROJECT.MEMBER': 'success',
  'PROPOSAL.MANAGER': 'pink',
  'PROPOSAL.MEMBER': 'success',
  Reviewer: 'blue',
};

export const getRoleColor = (roleName: string) =>
  ROLE_COLORS[roleName] || 'default';
