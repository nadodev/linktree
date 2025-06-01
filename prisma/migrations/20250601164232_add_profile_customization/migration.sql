-- AlterTable
ALTER TABLE `link` ADD COLUMN `icon` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `backgroundColor` VARCHAR(191) NULL,
    ADD COLUMN `backgroundImage` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `pageViews` INTEGER NOT NULL DEFAULT 0;
