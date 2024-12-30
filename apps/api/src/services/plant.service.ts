import dayjs from 'dayjs';
import { db } from '../db/db';
import { sql } from 'kysely';
import type { Plant } from '../db/types/plant';

export function PlantService() {
  async function updateNextWateringDate(plant: Plant) {
    const nextWateringDate = dayjs(new Date()).add(
      plant.watering_frequency ?? 0,
      'day',
    );
    const updatedPlant = await db
      .updateTable('plant')
      .where('id', '=', plant.id)
      .set('last_watered', sql`now()`)
      .set('next_watering_date', nextWateringDate.toDate())
      .returningAll()
      .executeTakeFirstOrThrow();
    return updatedPlant;
  }
  return {
    updateNextWateringDate,
  };
}

export const plantService = PlantService();
