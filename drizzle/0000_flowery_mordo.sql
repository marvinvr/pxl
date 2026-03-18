CREATE TABLE `opens` (
	`id` text PRIMARY KEY NOT NULL,
	`pixel_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`ip` text,
	`user_agent` text,
	`ua_browser` text,
	`ua_os` text,
	`ua_device` text,
	`referer` text,
	`accept_language` text,
	`raw_headers` text,
	`raw_url` text,
	`raw_method` text,
	FOREIGN KEY (`pixel_id`) REFERENCES `pixels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `opens_pixel_id_idx` ON `opens` (`pixel_id`);--> statement-breakpoint
CREATE INDEX `opens_timestamp_idx` ON `opens` (`timestamp`);--> statement-breakpoint
CREATE TABLE `pixels` (
	`id` text PRIMARY KEY NOT NULL,
	`tracking_id` text NOT NULL,
	`name` text NOT NULL,
	`provider_id` text,
	`recipient_hint` text,
	`notes` text,
	`notify_on_every_open` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pixels_tracking_id_idx` ON `pixels` (`tracking_id`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`enabled` integer DEFAULT 1,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `unmatched_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`requested_path` text NOT NULL,
	`ip` text,
	`user_agent` text,
	`referer` text,
	`raw_headers` text
);
--> statement-breakpoint
CREATE INDEX `unmatched_requests_timestamp_idx` ON `unmatched_requests` (`timestamp`);