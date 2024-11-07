import { useCallback, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { SIDEBAR_RESOURCES_FILTER_FORM } from '@waldur/marketplace/constants';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { Customer, Project } from '@waldur/workspace/types';

import { useOrganizationAndProjectFiltersForResources } from './utils';

interface FormData {
  organization?: Customer;
  project?: Project;
}

export const FilterByOrgAndProjectDialog = reduxForm<FormData>({
  form: SIDEBAR_RESOURCES_FILTER_FORM,
  destroyOnUnmount: true,
})((props) => {
  const dispatch = useDispatch<any>();
  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  const formValues = useSelector(
    getFormValues(SIDEBAR_RESOURCES_FILTER_FORM),
  ) as FormData;

  const apply = useCallback(
    (formData) => {
      if (formData) {
        syncResourceFilters(formData);
        dispatch(closeModalDialog());
      }
    },
    [dispatch],
  );

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!formValues?.project) return;
    if (
      !formValues?.organization ||
      formValues.organization.uuid !== formValues.project.customer_uuid
    ) {
      dispatch(props.change('project', undefined));
    }
  }, [formValues, props.change]);

  return (
    <form onSubmit={props.handleSubmit(apply)}>
      <MetronicModalDialog
        title={translate('Filter by organization/project')}
        subtitle={translate(
          'Filter results by chosen organization and project',
        )}
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <Button type="submit" className="flex-equal">
              {translate('Apply')}
            </Button>
          </>
        }
      >
        <div className="d-flex flex-column gap-7">
          <OrganizationAutocomplete />
          <ProjectFilter
            customer_uuid={formValues?.organization?.uuid}
            isDisabled={!formValues?.organization?.uuid}
          />
        </div>
      </MetronicModalDialog>
    </form>
  );
});
