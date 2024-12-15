import webPush, {type PushSubscription} from 'web-push';
import { db } from '../db/db';
import type {Subscription} from "../db/types/subscription";

function WebPushService() {
	if(!process.env.VAPID_KEY_PUBLIC || !process.env.VAPID_KEY_PRIVATE) {
		throw new Error('No public/private vapid keys in environment variables');
	}
	webPush.setVapidDetails(
		'mailto:your-email@example.com',
		process.env.VAPID_KEY_PUBLIC,
		process.env.VAPID_KEY_PRIVATE
	);

	function formatSubscription(subscription: Subscription): PushSubscription {
		return {
			endpoint: subscription.endpoint,
			keys: {
				p256dh: subscription.p256dh,
				auth: subscription.auth
			}
		}
	}

	return {
		sendToUser: async (user_id: string, payload: {
			title: string;
			body: string;
		}) => {
			const subscriptions = await db.selectFrom('subscription').selectAll().where('user_id', '=', user_id).execute();
			for(const subscription of subscriptions) {
				webPush.sendNotification(formatSubscription(subscription), JSON.stringify(payload))
					.then(res => console.log('Notification sent', res))
					.catch(err => {
						throw err;
					});
			}

		}
	}
}

export const webPushService = WebPushService();