-- Store uploaded task attachment metadata.
ALTER TABLE `tasks` ADD COLUMN `attachments` JSON NULL;
