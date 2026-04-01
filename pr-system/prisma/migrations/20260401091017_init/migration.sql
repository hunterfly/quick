-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pr_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prNumber" TEXT NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submittedAt" DATETIME,
    CONSTRAINT "pr_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pr_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "requiredDate" DATETIME NOT NULL,
    CONSTRAINT "pr_items_prId_fkey" FOREIGN KEY ("prId") REFERENCES "pr_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pr_approvals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prId" INTEGER NOT NULL,
    "approverId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pr_approvals_prId_fkey" FOREIGN KEY ("prId") REFERENCES "pr_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pr_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "approval_rules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "minAmount" REAL NOT NULL,
    "maxAmount" REAL NOT NULL,
    "requiredLevels" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_prId_fkey" FOREIGN KEY ("prId") REFERENCES "pr_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pr_requests_prNumber_key" ON "pr_requests"("prNumber");
