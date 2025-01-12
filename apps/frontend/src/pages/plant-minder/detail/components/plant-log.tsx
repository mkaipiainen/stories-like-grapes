import { Audit } from '@api/src/db/types/audit';
import { Timeline, Text, Title, Skeleton } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faPencil,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useAppSelector } from '@/src/stores/store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface PlantLogProps {
  logs: Audit[];
  isLoading?: boolean;
}

const getActionIcon = (action: string): IconDefinition => {
  switch (action) {
    case 'WATER':
      return faDroplet;
    case 'UPDATE':
      return faPencil;
    case 'DELETE':
      return faTrash;
    case 'CREATE':
      return faPlus;
    default:
      return faPencil;
  }
};

const getActionColor = (action: string): string => {
  switch (action) {
    case 'WATER':
      return 'blue';
    case 'UPDATE':
      return 'yellow';
    case 'DELETE':
      return 'red';
    case 'CREATE':
      return 'green';
    default:
      return 'gray';
  }
};

export function PlantLog({ logs, isLoading }: PlantLogProps) {
  const users = useAppSelector((state) => state.authReducer.users);

  if (isLoading) {
    return (
      <div className="px-4">
        <Title order={4} mb="md">
          Activity Log
        </Title>
        <Skeleton height={200} />
      </div>
    );
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="px-4">
      <Title order={4} mb="md">
        Activity Log
      </Title>
      <Timeline bulletSize={24} lineWidth={2}>
        {sortedLogs.map((log) => {
          const user = users.find((u) => u.id === log.user_id);
          const color = getActionColor(log.action);
          const icon = getActionIcon(log.action);
          const date = dayjs(log.date);

          return (
            <Timeline.Item
              key={log.id}
              bullet={<FontAwesomeIcon icon={icon} size="sm" />}
              color={color}
            >
              <div className="flex flex-col">
                <Text size="sm" fw={500}>
                  {user?.name || 'Unknown user'} {log.action.toLowerCase()}ed
                  the plant
                </Text>
                <div className="flex gap-2">
                  <Text size="xs" c="dimmed">
                    {date.fromNow()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    · {date.format('MMM D, YYYY [at] h:mm A')}
                  </Text>
                </div>
                {log.action === 'UPDATE' && log.before && log.after && (
                  <Text size="xs" mt={4}>
                    Changed {Object.keys(log.after).join(', ')}
                  </Text>
                )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
