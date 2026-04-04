-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "gender" TEXT,
    "birthDate" DATETIME,
    "age" INTEGER,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "rank" TEXT NOT NULL DEFAULT 'C',
    "currentJob" TEXT,
    "experience" TEXT,
    "skills" TEXT,
    "education" TEXT,
    "desiredJob" TEXT,
    "desiredArea" TEXT,
    "desiredIncome" TEXT,
    "maxRate" INTEGER,
    "minRate" INTEGER,
    "hearingStaffId" TEXT,
    "meetingStaffId" TEXT,
    "source" TEXT,
    "ngCompanies" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "callReservedAt" DATETIME,
    "callAcquiredAt" DATETIME,
    "firstCallAt" DATETIME,
    "meetingAt" DATETIME,
    "docCreatedAt" DATETIME,
    "entryAt" DATETIME,
    "docPassedAt" DATETIME,
    "interviewSetAt" DATETIME,
    "interviewPlannedAt" DATETIME,
    "interviewedAt" DATETIME,
    "offeredAt" DATETIME,
    "offerAcceptedAt" DATETIME,
    "joinedAt" DATETIME,
    "closedAt" DATETIME,
    CONSTRAINT "Candidate_hearingStaffId_fkey" FOREIGN KEY ("hearingStaffId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Candidate_meetingStaffId_fkey" FOREIGN KEY ("meetingStaffId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,
    "staffId" TEXT,
    "calledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "result" TEXT NOT NULL,
    "memo" TEXT,
    "twilioCallSid" TEXT,
    CONSTRAINT "CallLog_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CallLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER,
    CONSTRAINT "Document_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENTRY',
    "result" TEXT,
    "feedback" TEXT,
    "entryAt" DATETIME,
    "docPassedAt" DATETIME,
    "interviewSetAt" DATETIME,
    "interviewPlannedAt" DATETIME,
    "interviewedAt" DATETIME,
    "offeredAt" DATETIME,
    "offerAcceptedAt" DATETIME,
    CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
