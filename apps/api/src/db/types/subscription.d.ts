import { Generated, Selectable } from 'kysely';

export type SubscriptionTable = {
	id: Generated<string>;
	auth: string;
	p256dh: string;
	user_id: string;
	endpoint: string;
};

export type Subscription = Selectable<SubscriptionTable>;