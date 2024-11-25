import { db } from '../db';

export default {
  Query: {
    Plants: async (parent: any, args: any, context: any) => {
      const query = `
        SELECT *, entity_tag as tags FROM plant
        LEFT JOIN entity_tag ON entity_tag.entity_id = plant.id AND entity_tag.entity_type = 'plant'
      `
      return await db.query('SELECT * FROM plant').then((res) => res.rows);
    },
  },
  Mutation: {
    createPlant: async (parent: any, args: any, context: any) => {
      const createPlantQuery = `
        INSERT INTO plant (name, description)
        VALUES ($1, $2)
        RETURNING *
      `
      const createTagsQuery = `
        INSERT INTO entity_tag (entity_id, entity_type, tag)
        VALUES ($1, 'plant', $2)
      `
      const client = await db.connect();
      await client.query('BEGIN')
      try {
        const plant = await client.query(createPlantQuery, [args.name, args.description]).then((res) => res.rows[0]);
        if (!args.tags) {
          return plant;
        } else {
          await Promise.all(args.tags.map((tag: string) => {
            return client.query(createTagsQuery, [plant.id, 'plant', tag]);
          }));
          await client.query('COMMIT')
          return plant;
        }
      } catch(e) {
        await client.query('ROLLBACK')
        throw e;
      }
      finally {
        client.release();
      }

    },
  }
}