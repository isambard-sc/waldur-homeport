import { Alert } from 'react-bootstrap';

export const ErredRemoteConnection = ({ error, message }) => (
  <Alert variant="danger">
    <h4>{message}</h4>
    {error?.message && <p>{error.message}</p>}
  </Alert>
);
