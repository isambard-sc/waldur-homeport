
export const requestedProjectAccept = async ({ path }) => {
  const response = await fetch(`/api/openportal/project-request/${path.uuid}/accept/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to accept project request');
  }
  return response.json();
}

export const requestedProjectCancel = async ({ path }) => {
  const response = await fetch(`/api/openportal/project-request/${path.uuid}/reject/`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reject project request');
  }
  return response.json();
};


export const requestedProjectActions = {
  accept: requestedProjectAccept,
  cancel: requestedProjectCancel,
};

export const RequestedProjectActions = {
  accept: {
    label: 'Accept',
    action: requestedProjectActions.accept,
  },
  cancel: {
    label: 'Reject',
    action: requestedProjectActions.cancel,
  },
};
