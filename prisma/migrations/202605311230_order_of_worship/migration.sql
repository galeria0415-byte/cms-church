CREATE TABLE `OrderOfWorship` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `worshipDate` DATETIME(3) NULL,
    `serviceTime` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `content` LONGTEXT NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrderOfWorship_slug_key`(`slug`),
    INDEX `OrderOfWorship_status_worshipDate_idx`(`status`, `worshipDate`),
    INDEX `OrderOfWorship_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `OrderOfWorship`
    ADD CONSTRAINT `OrderOfWorship_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `User`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;