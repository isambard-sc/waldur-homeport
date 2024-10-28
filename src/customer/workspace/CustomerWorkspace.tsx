import { Transition } from '@uirouter/react';

import { getFirst } from '@waldur/core/api';
import { getCustomer } from '@waldur/project/api';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import {
  checkCustomerUser,
  checkIsServiceManager,
  getProject as getProjectSelector,
  getUser,
} from '@waldur/workspace/selectors';
import { WorkspaceType, Project } from '@waldur/workspace/types';

import { getCustomerCredit } from '../credits/api';

export async function fetchCustomer(transition: Transition) {
  const project = getProjectSelector(store.getState());
  const currentUser = getUser(store.getState());
  const customerId = transition.params()?.uuid;
  if (!customerId) {
    router.stateService.go('errorPage.notFound');
  } else {
    try {
      const currentCustomer = await getCustomer(customerId);
      const credit = await getCustomerCredit(currentCustomer?.uuid);
      Object.assign(currentCustomer, { credit });
      store.dispatch(setCurrentCustomer(currentCustomer));
      if (!project || project.customer_uuid != customerId) {
        const newProject = await getFirst<Project>('/projects/', {
          customer: customerId,
        });
        store.dispatch(setCurrentProject(newProject));
      }
      store.dispatch(setCurrentWorkspace(WorkspaceType.ORGANIZATION));

      const projectPermissions = currentUser.permissions?.filter(
        ({ scope_type, customer_uuid }) =>
          scope_type === 'project' && customer_uuid === currentCustomer.uuid,
      );

      if (
        !checkCustomerUser(currentCustomer, currentUser) &&
        !checkIsServiceManager(currentCustomer, currentUser) &&
        !currentUser.is_support &&
        !projectPermissions?.length
      ) {
        router.stateService.go('errorPage.notFound');
      }
    } catch {
      router.stateService.go('errorPage.notFound');
    }
  }
}
