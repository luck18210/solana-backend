-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEarlyRecruiter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFirstRecruiter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFirstStep" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGuildMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPioneer" BOOLEAN NOT NULL DEFAULT false;
