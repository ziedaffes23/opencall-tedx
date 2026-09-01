CREATE TABLE `speaker_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`age` int NOT NULL,
	`cityCountry` varchar(160) NOT NULL,
	`currentStatus` varchar(80) NOT NULL,
	`currentWork` varchar(320) NOT NULL,
	`links` varchar(700),
	`idea` text NOT NULL,
	`disagreement` text NOT NULL,
	`oneThing` text NOT NULL,
	`area` varchar(100) NOT NULL,
	`spokenBefore` enum('Yes','No') NOT NULL,
	`speakingWhere` varchar(500),
	`whySpeak` text NOT NULL,
	`photoUrl` varchar(1000) NOT NULL,
	`anythingElse` text,
	`consent` int NOT NULL,
	`status` enum('new','reviewed','contacted') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speaker_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
