import './calendar.page.css';
import {
  Button,
  Modal,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePicker, DateTimePicker } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { trpc } from '@/src/util/trpc';
import { useAppSelector } from '@/src/stores/store';

export function CalendarPage() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [opened, { open, close }] = useDisclosure(false);
  const users = useAppSelector((state) => state.authReducer.users);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    participants: [] as string[],
  });

  const formattedDate = useMemo(() => {
    return dayjs(date)?.format('dddd - DD.MM');
  }, [date]);

  // Transform users into format needed for MultiSelect
  const userOptions = useMemo(() => {
    return users.map((user) => ({
      value: user.id,
      label: user.name || user.email,
    }));
  }, [users]);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl relative">
      <div className="calendar-container bg-background-primary rounded shadow h-full flex">
        {/* Fixed sidebar */}
        <div className="small-calendar p-4 border-r border-r-background-primary-border shadow-right h-full">
          <DatePicker allowDeselect={false} value={date} onChange={setDate} />
          <div className="mt-4">
            <Button fullWidth onClick={open}>
              Add Event
            </Button>
          </div>
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

      {/* Create Event Modal */}
      <Modal opened={opened} onClose={close} title="Create New Event">
        <Stack>
          <TextInput
            label="Title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            required
          />

          <DateTimePicker
            label="Start Time"
            value={newEvent.startTime}
            onChange={(date) =>
              date && setNewEvent({ ...newEvent, startTime: date })
            }
            required
          />

          <DateTimePicker
            label="End Time"
            value={newEvent.endTime}
            onChange={(date) =>
              date && setNewEvent({ ...newEvent, endTime: date })
            }
          />

          <MultiSelect
            label="Participants"
            placeholder="Select participants"
            data={userOptions}
            value={newEvent.participants}
            onChange={(value) =>
              setNewEvent({ ...newEvent, participants: value })
            }
          />

          <Textarea
            label="Description"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />

          <Button
            onClick={() => {
              // TODO: Implement event creation
              console.log('Create event:', newEvent);
              close();
            }}
          >
            Create Event
          </Button>
        </Stack>
      </Modal>
    </div>
  );
}
