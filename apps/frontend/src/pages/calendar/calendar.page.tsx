import './calendar.page.css';
import { Text } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

export function CalendarPage() {
  const [date, setDate] = useState<Date | null>(new Date());
  const formattedDate = useMemo(() => {
    return dayjs(date)?.format('dddd - DD.MM');
  }, [date]);
  return (
    <div className="flex flex-col h-full w-full max-w-5xl relative">
      <div className="calendar-container bg-background-primary rounded shadow h-full flex">
        {/* Fixed sidebar */}
        <div className="small-calendar p-4 border-r border-r-background-primary-border shadow-right h-full">
          <DatePicker allowDeselect={false} value={date} onChange={setDate} />
        </div>

        {/* Scrollable main calendar */}
        <div className="relative main-calendar p-4 flex flex-col flex-grow overflow-hidden">
          <div className="mb-4">{formattedDate}</div>

          <div className="flex-grow w-full relative px-16 py-4 box-border overflow-y-auto slg-scrollbar">
            <div className="w-full flex flex-col">
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="w-full flex-initial flex items-center h-16 relative"
                >
                  <Text size="sm" className="absolute -left-12">
                    {index > 12 ? `${index % 12} PM` : `${index} AM`}
                  </Text>
                  <div className="h-px w-full bg-background-primary-border"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
