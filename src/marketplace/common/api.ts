import { get, getAll, getById, post, sendForm, getList, getFirst, patch, deleteById } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { Customer } from '@waldur/customer/types';
import { SubmitCartRequest } from '@waldur/marketplace/cart/types';
import { State, OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Category, Offering, ServiceProvider, CategoryComponentUsage } from '@waldur/marketplace/types';

// tslint:disable: variable-name

export const getPlugins = () =>
  get('/marketplace-plugins/').then(response => response.data);

export const getCategories = (options?: {}) =>
  getAll<Category>('/marketplace-categories/', options);

export const getCategoryUsages = (options?: {}) =>
  getAll<CategoryComponentUsage>('/marketplace-category-component-usages/', options);

export const getCategory = (id: string, options?: {}) =>
  getById<Category>('/marketplace-categories/', id, options);

export const getOfferingsList = (params?: {}) =>
  getList<Offering>('/marketplace-offerings/', params);

export const getAllOfferings = (options?: {}) =>
  getAll<Offering>('/marketplace-offerings/', options);

export const getProviderOfferings = (customerUuid: string) =>
  getAllOfferings({params: {customer_uuid: customerUuid}});

export const getOffering = (id: string): Promise<Offering> =>
  getById<Offering>('/marketplace-offerings/', id);

export const createOffering = data =>
  post<Offering>('/marketplace-offerings/', data);

export const updateOffering = (offeringId, data) =>
  patch<Offering>(`/marketplace-offerings/${offeringId}/`, data);

export const uploadOfferingThumbnail = (offeringId, thumbnail) =>
  sendForm<Offering>('PATCH', `${ENV.apiEndpoint}api/marketplace-offerings/${offeringId}/`, {thumbnail});

export const getCartItems = () =>
  getAll('/marketplace-cart-items/');

export const addCartItem = (data: object) =>
  post('/marketplace-cart-items/', data).then(response => response.data);

export const removeCartItem = (id: string) =>
  deleteById('/marketplace-cart-items/', id);

export const updateCartItem = (id: string, data: object) =>
  patch(`/marketplace-cart-items/${id}/`, data).then(response => response.data);

export const submitCart = (data: object) =>
  post<SubmitCartRequest>('/marketplace-cart-items/submit/', data).then(response => response.data);

export const getOrderDetails = (id: string) =>
  getById<State>('/marketplace-orders/', id);

export const getOrderItem = id =>
  getById<OrderItemResponse>('/marketplace-order-items/', id);

export const approveOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/approve/`).then(response => response.data);

export const rejectOrder = (orderUuid: string) =>
  post(`/marketplace-orders/${orderUuid}/reject/`).then(response => response.data);

export const getCustomerList = (params?: {}) =>
  getList<Customer>('/customers/', params);

export const getProjectList = (params?: {}) =>
  getList<Customer>('/projects/', params);

export const getCustomer = (id: string) =>
  getById<Customer>('/customers/', id);

export const updateOfferingState = (offeringUuid, action) =>
  post(`/marketplace-offerings/${offeringUuid}/${action}/`).then(response => response.data);

export const getServiceProviderList = (params?: {}) =>
  getList<ServiceProvider>('/marketplace-service-providers/', params);

export const createServiceProvider = params =>
  post<ServiceProvider>('/marketplace-service-providers/', params).then(response => response.data);

export const getServiceProviderByCustomer = params =>
  getFirst<ServiceProvider>('/marketplace-service-providers/', params);

export const getServiceProviderSecretCode = id =>
  get(`/marketplace-service-providers/${id}/api_secret_code/`).then(response => response.data);

export const generateServiceProviderSecretCode = id =>
  post(`/marketplace-service-providers/${id}/api_secret_code/`).then(response => response.data);

export const submitUsageReport = payload =>
  post(`/marketplace-component-usages/set_usage/`, payload).then(response => response.data);

export const getResource = (id: string) =>
  getById<OrderItemResponse>('/marketplace-resources/', id);

export const switchPlan = (resource_uuid: string, plan_url: string) =>
  post(`/marketplace-resources/${resource_uuid}/switch_plan/`, {plan: plan_url}).then(response => response.data);

export const terminateResource = (resource_uuid: string) =>
  post(`/marketplace-resources/${resource_uuid}/terminate/`).then(response => response.data);
