import { post } from '@waldur/core/api';

/**
 * Creates a new user account or returns existing user if email already exists
 *
 * TODO: This API endpoint needs to be implemented in waldur_mastermind backend
 * The endpoint should be created at: waldur_mastermind/proposals/views.py
 *
 * Expected backend behavior:
 * - POST /api/proposals-users/
 * - Request body: { email, first_name, last_name }
 * - Response: User object (either newly created or existing)
 * - If user with email exists, return that user
 * - If user doesn't exist, create new user and return it
 *
 * @param email - User's email address
 * @param first_name - User's first name
 * @param last_name - User's last name
 * @returns Promise with user object
 */
export const createProposalUser = async ({
  email,
  first_name,
  last_name,
}: {
  email: string;
  first_name: string;
  last_name: string;
}) => {
  // TODO: Replace with actual API call when backend is implemented
  // return await post('/api/proposals-users/', {
  //   email,
  //   first_name,
  //   last_name,
  // });

  // Temporary mock response for development
  return {
    uuid: 'temp-' + Date.now(),
    email,
    first_name,
    last_name,
    full_name: `${first_name} ${last_name}`,
    username: email.split('@')[0],
    is_active: true,
    registration_method: 'default',
  };
};
