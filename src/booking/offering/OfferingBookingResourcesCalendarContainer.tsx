import { ArrowsClockwise } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { getBookingsList } from '@waldur/booking/api';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { getBookingFilterOptionStates } from '@waldur/booking/utils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { orderByFilter } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { BookingResourcesCalendar } from './BookingResourcesCalendar';

async function loadBookingOfferings(offeringUuid: string) {
  return await getBookingsList({
    offering_uuid: offeringUuid,
    offering_type: OFFERING_TYPE_BOOKING,
    state: [
      getBookingFilterOptionStates()[0],
      getBookingFilterOptionStates()[1],
    ].map(({ value }) => value),
    o: orderByFilter({ field: 'created', mode: 'desc' }),
  });
}

interface OfferingBookingResourcesCalendarContainerProps {
  offering: Offering;
}

export const OfferingBookingResourcesCalendarContainer: FunctionComponent<
  OfferingBookingResourcesCalendarContainerProps
> = ({ offering }) => {
  const {
    data: calendarEvents,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery(['offeringBookings', offering.uuid], () =>
    loadBookingOfferings(offering.uuid),
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load booking offerings.')}
      />
    );
  }

  return (
    <Card className="card-bordered offering-bookings">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Bookings')}</span>
          {isRefetching ? (
            <LoadingSpinner />
          ) : (
            <button
              className="btn btn-icon btn-active-light"
              onClick={() => refetch()}
            >
              <ArrowsClockwise />
            </button>
          )}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <BookingResourcesCalendar
          bookingResources={calendarEvents}
          refetch={refetch}
        />
      </Card.Body>
    </Card>
  );
};
