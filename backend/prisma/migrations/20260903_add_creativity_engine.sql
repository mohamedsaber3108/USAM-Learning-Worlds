-- Creativity Engine: zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md
-- ("No model, service, or module... ai-task.interface.ts has a 'creative'
-- task-type enum value used generically by the AI provider abstraction, but
-- no dedicated creativity workflow, prompt library, or output gallery.").
-- Built from scratch this pass: CreativityPrompt (curriculum-authored open
-- -ended creative prompts, optionally tagged to a Domain) + a lightweight
-- CreativitySubmission gallery layer.

CREATE TYPE "CreativitySubmissionVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

CREATE TABLE "creativity_prompts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "domainId" TEXT,
    "ageBand" "AgeBand" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creativity_prompts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "creativity_prompts_title_key" ON "creativity_prompts"("title");
CREATE UNIQUE INDEX "creativity_prompts_slug_key" ON "creativity_prompts"("slug");
CREATE INDEX "creativity_prompts_slug_idx" ON "creativity_prompts"("slug");
CREATE INDEX "creativity_prompts_domainId_idx" ON "creativity_prompts"("domainId");
CREATE INDEX "creativity_prompts_ageBand_idx" ON "creativity_prompts"("ageBand");

ALTER TABLE "creativity_prompts" ADD CONSTRAINT "creativity_prompts_domainId_fkey"
    FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "creativity_submissions" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "visibility" "CreativitySubmissionVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creativity_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "creativity_submissions_promptId_idx" ON "creativity_submissions"("promptId");
CREATE INDEX "creativity_submissions_learnerId_idx" ON "creativity_submissions"("learnerId");
CREATE INDEX "creativity_submissions_visibility_idx" ON "creativity_submissions"("visibility");

ALTER TABLE "creativity_submissions" ADD CONSTRAINT "creativity_submissions_promptId_fkey"
    FOREIGN KEY ("promptId") REFERENCES "creativity_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "creativity_submissions" ADD CONSTRAINT "creativity_submissions_learnerId_fkey"
    FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
