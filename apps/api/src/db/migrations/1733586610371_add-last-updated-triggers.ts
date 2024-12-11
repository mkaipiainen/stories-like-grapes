import { CompiledQuery, Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.executeQuery(CompiledQuery.raw(`CREATE OR REPLACE FUNCTION update_date_updated_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.date_updated = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`
  ))
  await db.executeQuery(CompiledQuery.raw(`
    CREATE TRIGGER set_date_updated
    BEFORE UPDATE ON plant
    FOR EACH ROW
    EXECUTE FUNCTION update_date_updated_column();`
  ));
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(CompiledQuery.raw(`DROP TRIGGER set_date_updated ON plant;`
  ))
  await db.executeQuery(CompiledQuery.raw(`DROP FUNCTION update_date_updated_column();`
  ));
}
