import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { getAll } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { deleteCustomer } from '@waldur/project/api';
import { showError } from '@waldur/store/notify';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import {
  getUser,
  isOwner as isOwnerSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { canManageCustomer } from '../create/selectors';

const OrganizationRemovalErrorDialog = lazyComponent(
  () => import('@waldur/customer/details/OrganizationRemovalErrorDialog'),
  'OrganizationRemovalErrorDialog',
);

const loadInvoices = (customer) =>
  getAll<{ state: string; price: string }>('/invoices/', {
    params: { field: ['state', 'price'], customer_uuid: customer.uuid },
  });

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const ownerCanManage = useSelector(canManageCustomer);
  const canDeleteCustomer = user.is_staff || (isOwner && ownerCanManage);
  const { loading, value: invoices } = useAsync(() => loadInvoices(customer));
  const dispatch = useDispatch();
  const router = useRouter();

  const removeCustomer = () => {
    const hasActiveInvoices = invoices.some(
      (invoice) => invoice.state !== 'pending' || parseFloat(invoice.price) > 0,
    );
    const hasProjects = customer.projects.length > 0;
    const needsSupport = hasProjects || hasActiveInvoices;

    if (needsSupport) {
      if (!ENV.plugins.WALDUR_SUPPORT.ENABLED) {
        const notification = hasProjects
          ? translate(
              'Organization contains projects. Please remove them first.',
            )
          : hasActiveInvoices
          ? translate(
              'Organization contains invoices. Please remove them first.',
            )
          : '';
        return notification
          ? dispatch(showError(notification))
          : dispatch(openModalDialog(OrganizationRemovalErrorDialog));
      }
      return dispatch(
        openIssueCreateDialog({
          issue: {
            customer,
            type: ISSUE_IDS.CHANGE_REQUEST,
            summary: translate('Organization removal'),
          },
          hideProjectAndResourceFields: true,
          options: {
            title: translate('Organization removal'),
            hideTitle: true,
            descriptionLabel: translate('Reason'),
            descriptionPlaceholder: translate(
              'Why do you need to remove organization with existing projects?',
            ),
            submitTitle: translate('Request removal'),
          },
        }),
      );
    }

    const confirmDelete = confirm(translate('Confirm deletion?'));
    if (confirmDelete) {
      store.dispatch(setCurrentCustomer(null));
      deleteCustomer(customer.uuid).then(
        () => {
          router.stateService.go('profile.details');
        },
        () => store.dispatch(setCurrentCustomer(customer)),
      );
    }
  };

  return loading ? (
    <LoadingSpinner />
  ) : canDeleteCustomer ? (
    <Card className="mt-5">
      <Card.Header>
        <Card.Title>
          <h3 className="text-danger">{translate('Remove organization')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body className="d-flex justify-content-between">
        <ul>
          <li>
            {translate(
              'You can remove this organization by pressing the button',
            )}
          </li>
          <li>
            {translate(
              'Removing the organization will delete all related resources.',
            )}
          </li>
          <li>{translate('Removed organizations cannot be restored!')}</li>
        </ul>
        <div>
          <Button onClick={removeCustomer} variant="danger">
            <i className="fa fa-trash" /> {translate('Remove organization')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  ) : null;
};
