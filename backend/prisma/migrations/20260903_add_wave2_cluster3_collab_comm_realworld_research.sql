-- Wave 2 Cluster 3: Collaboration Engine, Communication Engine,
-- Real-World Challenge Engine, Research Engine. All four were zero-trace
-- "Missing" rows per USAM_KIDS_ENGINE_GAP_MATRIX.md. Built from scratch,
-- kept deliberately small and real (see schema.prisma comments on each
-- model for the exact gap-matrix quote each one closes).

-- ---------- Real-World Challenge Engine ----------
-- Two fields added directly to the existing Project model, not a new
-- system.
ALTER TABLE "projects" ADD COLUMN "isRealWorldChallenge" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "externalSourceUrl" TEXT;
CREATE INDEX "projects_isRealWorldChallenge_idx" ON "projects"("isRealWorldChallenge");

-- ---------- Collaboration Engine ----------
CREATE TYPE "ProjectCollaboratorRole" AS ENUM ('EDITOR', 'COMMENTER');

CREATE TABLE "project_collaborators" (
    "id"        TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "role"      "ProjectCollaboratorRole" NOT NULL DEFAULT 'EDITOR',
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_collaborators_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_collaborators_projectId_learnerId_key" ON "project_collaborators"("projectId", "learnerId");
CREATE INDEX "project_collaborators_projectId_idx" ON "project_collaborators"("projectId");
CREATE INDEX "project_collaborators_learnerId_idx" ON "project_collaborators"("learnerId");

ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- Research Engine ----------
CREATE TABLE "research_notes" (
    "id"          TEXT NOT NULL,
    "projectId"   TEXT NOT NULL,
    "learnerId"   TEXT NOT NULL,
    "content"     TEXT NOT NULL,
    "sourceTitle" TEXT,
    "sourceUrl"   TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "research_notes_projectId_idx" ON "research_notes"("projectId");
CREATE INDEX "research_notes_learnerId_idx" ON "research_notes"("learnerId");

ALTER TABLE "research_notes" ADD CONSTRAINT "research_notes_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "research_notes" ADD CONSTRAINT "research_notes_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- Communication Engine ----------
CREATE TABLE "communication_skill_concepts" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "slug"           TEXT NOT NULL,
    "description"    TEXT,
    "ageAppropriate" "AgeBand" NOT NULL,
    "category"       TEXT NOT NULL,
    "order"          INTEGER NOT NULL DEFAULT 0,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_skill_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "communication_skill_concepts_name_key" ON "communication_skill_concepts"("name");
CREATE UNIQUE INDEX "communication_skill_concepts_slug_key" ON "communication_skill_concepts"("slug");
CREATE INDEX "communication_skill_concepts_slug_idx" ON "communication_skill_concepts"("slug");
CREATE INDEX "communication_skill_concepts_category_idx" ON "communication_skill_concepts"("category");
CREATE INDEX "communication_skill_concepts_ageAppropriate_idx" ON "communication_skill_concepts"("ageAppropriate");
