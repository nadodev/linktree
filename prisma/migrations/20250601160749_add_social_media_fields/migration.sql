-- AlterTable
ALTER TABLE `link` ADD COLUMN `isSocial` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `socialType` VARCHAR(191) NULL;
