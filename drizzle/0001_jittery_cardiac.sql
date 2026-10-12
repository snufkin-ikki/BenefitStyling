ALTER TABLE `pre_registrations` ADD `notification_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `pre_registrations` ADD `notification_sent_at` text;