-- Adds DEBATE and INTERVIEW to the ConversationType enum (Conversation
-- Engine gap: "guided/open/roleplay/debate/interview modes" per
-- docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md's inventory cross-check).
-- Postgres requires ALTER TYPE ... ADD VALUE outside a transaction block
-- run via prisma migrate deploy's normal transactional wrapper - this repo
-- already applies raw .sql migrations directly via psql (see Part 5b of
-- the gap matrix), so this file follows that same convention.

ALTER TYPE "ConversationType" ADD VALUE IF NOT EXISTS 'DEBATE';
ALTER TYPE "ConversationType" ADD VALUE IF NOT EXISTS 'INTERVIEW';
