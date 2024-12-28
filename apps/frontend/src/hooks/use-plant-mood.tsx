import { Plant } from '@api/src/db/types/plant';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { isNil } from 'rambda';
export type Mood = 'normal' | 'worried' | 'angry';
export function UsePlantMood(plant: Plant | undefined) {
  const [daysSinceWatering, setDaysSinceWatering] = useState<number>(0);
  const [daysUntilWatering, setDaysUntilWatering] = useState<number>(0);

  const [mood, setMood] = useState<Mood>(
    daysSinceWatering <= 0
      ? 'normal'
      : daysSinceWatering > 0 && daysSinceWatering < 3
        ? 'worried'
        : 'angry',
  );
  useEffect(() => {
    setMood(
      daysSinceWatering === 0
        ? 'normal'
        : daysSinceWatering > 0 && daysSinceWatering < 3
          ? 'worried'
          : 'angry',
    );
  }, [daysSinceWatering]);

  useEffect(() => {
    if (!isNil(plant?.next_watering_date)) {
      const dayDifference = dayjs(plant.next_watering_date).diff(
        dayjs(new Date()),
        'day',
      );
      setDaysUntilWatering(dayDifference);
      setDaysSinceWatering(dayDifference > 0 ? 0 : Math.abs(dayDifference));
    }
  }, [plant?.next_watering_date]);

  useEffect(() => {
    setMood(
      daysSinceWatering === 0
        ? 'normal'
        : daysSinceWatering > 0 && daysSinceWatering < 3
          ? 'worried'
          : 'angry',
    );
  }, [daysSinceWatering]);

  return {
    mood,
    daysSinceWatering,
    daysUntilWatering,
  };
}
