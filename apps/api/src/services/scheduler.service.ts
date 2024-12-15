import schedule from 'node-schedule';
import { db } from '../db/db';
import {sql} from "kysely";
import type {Plant} from "../db/types/plant";
import type {Subscription} from "../db/types/subscription";
import {webPushService} from "./web-push.service";
import type {Notification} from "../db/types/notification";

export function SchedulerService() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const notificationsByMinute = schedule.scheduleJob('* * * * *', async () => {
		console.log(`Searching for notifications at ${new Date().toISOString()}`)
		const notifications = await db
			.selectFrom('notification')
			.selectAll()
			.where('date', '<=', sql`CURRENT_DATE`) // Compare date column with CURRENT_DATE
			.execute();
		if(!notifications.length) {
			return;
		}
		console.log(`Found ${notifications.length} notifications`)
		const notificationsByUser = notifications.reduce((acc: Record<string, Notification[]>, notification) => {
			(acc[notification.user_id] ??= []).push(notification);
			return acc;
		}, {})
		const users = Object.keys(notificationsByUser);
		const subscriptions = await db.selectFrom('subscription').selectAll().where('user_id', 'in', users).execute();
		const subscriptionsByUser = subscriptions.reduce((acc: Record<string, Subscription[]>, subscription) => {
			(acc[subscription.user_id] ??= []).push(subscription);
			return acc;
		}, {})


		for(const user_id in subscriptionsByUser) {
			for(const notification of notificationsByUser[user_id]) {
				webPushService.sendToUser(user_id, {
					title: 'Water your plants!',
					body: JSON.stringify(notification.data)
				})
				console.log(`Notification sent to user ${user_id}`);
			}

		}
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const plantNotifications = schedule.scheduleJob('* 17 * * *', async () => {
		console.log(`Searching for plant-watering notifications at ${new Date().toISOString()}`)

		const plantsToWater = await db.selectFrom('plant').selectAll().where('next_watering_date', '<=', sql`CURRENT_DATE`).execute();
		if(!plantsToWater) {
			return;
		}
		const plantsByUser = plantsToWater.reduce((acc: Record<string, Plant[]>, plant) => {
			(acc[plant.user_id] ??= []).push(plant);
			return acc;
		}, {})
		const users = Object.keys(plantsByUser);
		const subscriptions = await db.selectFrom('subscription').selectAll().where('user_id', 'in', users).execute();
		const subscriptionsByUser = subscriptions.reduce((acc: Record<string, Subscription[]>, subscription) => {
			(acc[subscription.user_id] ??= []).push(subscription);
			return acc;
		}, {})

		for(const user_id in subscriptionsByUser) {
			const plantsForUser = plantsByUser[user_id];
			webPushService.sendToUser(user_id, {
				title: 'Water your plants!',
				body: `There are ${plantsForUser ? plantsForUser.length : ''} plants that need watering!`
			})
			console.log(`Notification sent to user ${user_id}`);
		}
	})
}