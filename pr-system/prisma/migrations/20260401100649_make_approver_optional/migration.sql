-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pr_approvals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prId" INTEGER NOT NULL,
    "approverId" INTEGER,
    "level" INTEGER NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pr_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pr_approvals_prId_fkey" FOREIGN KEY ("prId") REFERENCES "pr_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_pr_approvals" ("action", "approverId", "comment", "createdAt", "id", "level", "prId", "updatedAt") SELECT "action", "approverId", "comment", "createdAt", "id", "level", "prId", "updatedAt" FROM "pr_approvals";
DROP TABLE "pr_approvals";
ALTER TABLE "new_pr_approvals" RENAME TO "pr_approvals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
