-- Add task checklist data as a separate structured field.
ALTER TABLE `tasks` ADD COLUMN `checklist` JSON NULL;
