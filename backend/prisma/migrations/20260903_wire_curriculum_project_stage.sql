-- Curriculum Engine gap fix: wire the Project stage into the
-- Domain->Skill->Competency->LearningObjective chain. Previously Project
-- had no FK into the curriculum hierarchy at all (only a free-text
-- skills[] tag array).

ALTER TABLE "projects"
  ADD COLUMN "competencyId" TEXT,
  ADD COLUMN "objectiveId" TEXT;

ALTER TABLE "projects"
  ADD CONSTRAINT "projects_competencyId_fkey"
    FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "projects_objectiveId_fkey"
    FOREIGN KEY ("objectiveId") REFERENCES "learning_objectives"("id") ON DELETE SET NULL;

CREATE INDEX "projects_competencyId_idx" ON "projects"("competencyId");
