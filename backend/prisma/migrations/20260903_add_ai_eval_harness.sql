-- AI Evaluation Harness v1: AIEvalRun + AIEvalResult.
-- Zero automated quality-scoring existed for AI coach/character responses
-- before this pass. This migration adds two tables backing
-- backend/scripts/run-ai-eval.ts (the eval runner) and
-- GET /api/admin/ai-eval/runs (the historical-scores endpoint).
--
-- NOTE: written as raw SQL per repo convention (see prisma/migrations/*.sql
-- for prior examples) - this file is NOT applied by this agent. The
-- coordinator applies it centrally to avoid uncoordinated migrations against
-- the shared/prod database.

CREATE TABLE "ai_eval_runs" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "datasetVersion" TEXT NOT NULL,
    "totalCases" INTEGER NOT NULL,
    "passedCases" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    "notes" TEXT,

    CONSTRAINT "ai_eval_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_eval_results" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "criteriaTotal" INTEGER NOT NULL,
    "criteriaPassed" INTEGER NOT NULL,
    "criteriaDetail" JSONB NOT NULL,
    "responseText" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_eval_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_eval_runs_startedAt_idx" ON "ai_eval_runs"("startedAt");

CREATE INDEX "ai_eval_results_runId_idx" ON "ai_eval_results"("runId");
CREATE INDEX "ai_eval_results_domain_idx" ON "ai_eval_results"("domain");
CREATE INDEX "ai_eval_results_caseId_idx" ON "ai_eval_results"("caseId");

ALTER TABLE "ai_eval_results" ADD CONSTRAINT "ai_eval_results_runId_fkey"
    FOREIGN KEY ("runId") REFERENCES "ai_eval_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
