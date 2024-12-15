import {ColumnType, Generated, Selectable} from 'kysely';
import {EntityType} from "../../constants/entity.constant";

export type NotificationTable = {
	id: Generated<string>;
	entity_type: EntityType | null;
	entity_id: string | null;
	date_created: ColumnType<Date, never, never>;
	date_updated: ColumnType<Date, never, never>;
	user_id: string;
	data: Record<string, any>
	date: Date;
};

export type Notification = Selectable<NotificationTable>;