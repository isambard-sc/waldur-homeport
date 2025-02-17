import { BookedItem, BookingResource } from '@waldur/booking/types';
import { getAll, getList, post } from '@waldur/core/api';

export const getBookingsList = (params?: {}) =>
  getList<BookingResource>(`/booking-resources/`, params);

export const acceptBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/accept/`);

export const rejectBooking = (bookingUuid: string) =>
  post(`/booking-resources/${bookingUuid}/reject/`);

export const getOfferingBookedItems = (offeringUuid: string) =>
  getAll<BookedItem[]>(`/marketplace-bookings/${offeringUuid}/`).then(
    (res) => res,
  );
