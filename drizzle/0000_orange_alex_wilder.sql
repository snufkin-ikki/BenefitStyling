CREATE TABLE `pre_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`department` text NOT NULL,
	`title` text,
	`employee_size` text NOT NULL,
	`can_refer_decision_maker` integer NOT NULL,
	`introduction_likelihood` integer NOT NULL,
	`desired_services` text,
	`support_message` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_pre_registrations_email` ON `pre_registrations` (`email`);