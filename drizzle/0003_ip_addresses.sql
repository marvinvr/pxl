-- Create ip_addresses table
CREATE TABLE `ip_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`geo_country` text,
	`geo_city` text,
	`geo_region` text,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`geo_looked_up_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ip_addresses_ip_idx` ON `ip_addresses` (`ip`);
--> statement-breakpoint
-- Drop old tables (data loss on opens/clicks/unmatched is accepted)
DROP TABLE IF EXISTS `opens`;
--> statement-breakpoint
DROP TABLE IF EXISTS `clicks`;
--> statement-breakpoint
DROP TABLE IF EXISTS `unmatched_requests`;
--> statement-breakpoint
-- Recreate opens with ip_address_id FK
CREATE TABLE `opens` (
	`id` text PRIMARY KEY NOT NULL,
	`pixel_id` text NOT NULL,
	`ip_address_id` integer,
	`timestamp` integer NOT NULL,
	`user_agent` text,
	`ua_browser` text,
	`ua_os` text,
	`ua_device` text,
	`referer` text,
	`accept_language` text,
	`raw_headers` text,
	`raw_url` text,
	`raw_method` text,
	FOREIGN KEY (`pixel_id`) REFERENCES `pixels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ip_address_id`) REFERENCES `ip_addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `opens_pixel_id_idx` ON `opens` (`pixel_id`);
--> statement-breakpoint
CREATE INDEX `opens_timestamp_idx` ON `opens` (`timestamp`);
--> statement-breakpoint
CREATE INDEX `opens_ip_address_id_idx` ON `opens` (`ip_address_id`);
--> statement-breakpoint
-- Recreate clicks with ip_address_id FK
CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`ip_address_id` integer,
	`timestamp` integer NOT NULL,
	`user_agent` text,
	`ua_browser` text,
	`ua_os` text,
	`ua_device` text,
	`referer` text,
	`accept_language` text,
	`raw_headers` text,
	`raw_url` text,
	`raw_method` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ip_address_id`) REFERENCES `ip_addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `clicks_link_id_idx` ON `clicks` (`link_id`);
--> statement-breakpoint
CREATE INDEX `clicks_timestamp_idx` ON `clicks` (`timestamp`);
--> statement-breakpoint
CREATE INDEX `clicks_ip_address_id_idx` ON `clicks` (`ip_address_id`);
--> statement-breakpoint
-- Recreate unmatched_requests with ip_address_id FK
CREATE TABLE `unmatched_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`requested_path` text NOT NULL,
	`ip_address_id` integer,
	`user_agent` text,
	`referer` text,
	`raw_headers` text,
	FOREIGN KEY (`ip_address_id`) REFERENCES `ip_addresses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `unmatched_requests_timestamp_idx` ON `unmatched_requests` (`timestamp`);
