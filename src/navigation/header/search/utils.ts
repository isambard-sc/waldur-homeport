export const getResourceFilterFromSearchItem = (item: {
  to;
  params?;
  title;
}) => {
  const filter = { organization: null, project: null };

  switch (item.to) {
    case 'organization.dashboard':
      filter.organization = { uuid: item.params.uuid, name: item.title };
      break;
    case 'project.dashboard':
      filter.project = { uuid: item.params.uuid, name: item.title };
      break;
    case 'marketplace-resource-details':
      if (item.params.project_uuid && item.params.project_name) {
        filter.project = {
          uuid: item.params.project_uuid,
          name: item.params.project_name,
        };
      }
      break;

    default:
      break;
  }
  return filter;
};
