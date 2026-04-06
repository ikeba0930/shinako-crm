-- AlterTable
ALTER TABLE "Selection"
ADD COLUMN "applicantName" TEXT,
ADD COLUMN "applicationDate" TIMESTAMP(3),
ADD COLUMN "referralSource" TEXT,
ADD COLUMN "jobPostingUrl" TEXT,
ADD COLUMN "statusUpdatedAt" TIMESTAMP(3),
ADD COLUMN "nextActionAt" TIMESTAMP(3);
