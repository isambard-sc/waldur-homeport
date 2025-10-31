import { proposalAddUserCreate } from 'waldur-js-client';

/**
 * Creates a new user account or returns existing user if email already exists
 *
 * Backend endpoint: POST /api/proposal-add-user/
 * Request body: { email, first_name, last_name }
 * Response: User object (either newly created or existing)
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
  const response = await proposalAddUserCreate({
    body: {
      email,
      first_name,
      last_name,
    },
  });
  return response.data;
};
