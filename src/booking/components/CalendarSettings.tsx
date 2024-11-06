import { DateTime } from 'luxon';
import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { usePrevious } from 'react-use';

import { BusinessHoursGroup } from './BusinessHoursGroup';
import { SlotDurationGroup } from './SlotDurationGroup';
import { TimeZoneGroup } from './TimeZoneGroup';
import { WeekdaysGroup } from './WeekdaysGroup';
import { WeekendsGroup } from './WeekendsGroup';

const INITIAL_CONFIG = {
  weekends: true,
  minTime: '00:00',
  maxTime: '24:00',
  slotDuration: '01:00:00',
  businessHours: {
    startTime: '00:00',
    endTime: '24:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
};

export const CalendarSettings: FunctionComponent = () => {
  const [weekends, setWeekends] = useState<boolean>(INITIAL_CONFIG.weekends);
  const [slotDuration, setSlotDuration] = useState<any>(
    INITIAL_CONFIG.slotDuration,
  );
  const [startTime, setStartTime] = useState<any>(
    INITIAL_CONFIG.businessHours.startTime,
  );
  const [endTime, setEndTime] = useState<any>(
    INITIAL_CONFIG.businessHours.endTime,
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    INITIAL_CONFIG.businessHours.daysOfWeek,
  );
  const [timeZone, setTimeZone] = useState<any>(DateTime.local().zoneName);

  const prevWeekends = usePrevious(weekends);

  const updateWeekends = useCallback(() => {
    if (prevWeekends === weekends) {
      return;
    }
    if (weekends) {
      if (!daysOfWeek.includes(0) || !daysOfWeek.includes(6)) {
        setDaysOfWeek(daysOfWeek.concat([0, 6]));
      }
    } else {
      if (daysOfWeek.includes(0) || daysOfWeek.includes(6)) {
        setDaysOfWeek(daysOfWeek.filter((day) => !(day === 0 || day === 6)));
      }
    }
  }, [weekends, daysOfWeek, setDaysOfWeek, prevWeekends]);

  useEffect(() => {
    updateWeekends();
  }, [updateWeekends, weekends]);

  return (
    <>
      <BusinessHoursGroup
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />
      <WeekdaysGroup daysOfWeek={daysOfWeek} setDaysOfWeek={setDaysOfWeek} />
      <WeekendsGroup weekends={weekends} setWeekends={setWeekends} />
      <SlotDurationGroup
        slotDuration={slotDuration}
        setSlotDuration={setSlotDuration}
      />
      <TimeZoneGroup timeZone={timeZone} setTimeZone={setTimeZone} />
    </>
  );
};
