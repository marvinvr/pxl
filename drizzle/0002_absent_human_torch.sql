CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
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
	`geo_country` text,
	`geo_city` text,
	`geo_region` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `clicks_link_id_idx` ON `clicks` (`link_id`);--> statement-breakpoint
CREATE INDEX `clicks_timestamp_idx` ON `clicks` (`timestamp`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`short_code` text NOT NULL,
	`target_url` text NOT NULL,
	`name` text NOT NULL,
	`provider_id` text,
	`notes` text,
	`notify_on_every_click` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_short_code_idx` ON `links` (`short_code`);