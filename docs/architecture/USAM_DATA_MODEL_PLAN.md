# USAM Data Model Plan

**Date:** 2026-08-12
**Phase:** Educational Core Foundation

---

## Current Schema (20 Models) — PRESERVE

All existing models remain. New models extend the architecture.

---

## Proposed Additions for Educational Core

### Learning Graph (NEW)

```prisma
model Concept {
  id            String   @id @default(uuid())
  competencyId  String
  name          String
  slug          String   @unique
  description   String?
  order         Int      @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  competency    Competency @relation(fields: [competencyId], references: [id])
  objectives    LearningObjective[] // move FK from competency to concept
  prerequisites ConceptPrerequisite[] @relation("concept")
  dependents    ConceptPrerequisite[] @relation("prerequisite")

  @@index([competencyId])
  @@map("concepts")
}

model ConceptPrerequisite {
  id              String @id @default(uuid())
  conceptId       String
  prerequisiteId  String
  type            PrerequisiteType @default(REQUIRED)

  concept       Concept @relation("concept", fields: [conceptId], references: [id])
  prerequisite  Concept @relation("prerequisite", fields: [prerequisiteId], references: [id])

  @@unique([conceptId, prerequisiteId])
  @@map("concept_prerequisites")
}

enum PrerequisiteType {
  REQUIRED
  RECOMMENDED
  COREQUISITE
}
```

### Learning Paths (NEW)

```prisma
model LearningPath {
  id          String   @id @default(uuid())
  domainId    String
  name        String
  slug        String   @unique
  description String?
  ageBand     AgeBand?
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  domain Domain @relation(fields: [domainId], references: [id])
  nodes  LearningPathNode[]

  @@index([domainId])
  @@map("learning_paths")
}

model LearningPathNode {
  id         String @id @default(uuid())
  pathId     String
  skillId    String?
  conceptId  String?
  missionId  String?
  order      Int    @default(0)
  isOptional Boolean @default(false)

  path    LearningPath @relation(fields: [pathId], references: [id])

  @@index([pathId])
  @@map("learning_path_nodes")
}
```

### Age Adaptation (NEW)

```prisma
model AgeVariant {
  id              String   @id @default(uuid())
  entityType      String   // "ACTIVITY", "OBJECTIVE", "MISSION"
  entityId        String
  ageBand         AgeBand
  framing         String   // How it's presented to this age
  languageLevel   String?  // Simple, moderate, complex
  scaffoldLevel   ScaffoldLevel @default(GUIDED)
  surface         String?  // visual, blocks, text, conversation
  estimatedMinutes Int?
  content         Json?    // Age-specific content overrides
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([entityType, entityId, ageBand])
  @@index([entityType, entityId])
  @@map("age_variants")
}

enum ScaffoldLevel {
  MODELLED
  GUIDED
  COACHED
  INDEPENDENT
}
```

### Mission-Activity Linkage (FIX)

```prisma
model MissionActivity {
  id         String @id @default(uuid())
  missionId  String
  activityId String
  order      Int    @default(0)
  isRequired Boolean @default(true)

  mission  Mission  @relation(fields: [missionId], references: [id])
  activity Activity @relation(fields: [activityId], references: [id])

  @@unique([missionId, activityId])
  @@index([missionId])
  @@map("mission_activities")
}
```

### Content Lifecycle (NEW)

```prisma
model ContentItem {
  id            String         @id @default(uuid())
  type          ContentType
  title         String
  content       Json
  metadata      Json?
  language      String         @default("en")
  ageBand       AgeBand?
  domainId      String?
  objectiveId   String?
  difficulty    DifficultyLevel?
  status        ContentStatus  @default(DRAFT)
  version       Int            @default(1)
  generatedBy   String?        // "AI" or "HUMAN" or userId
  validatedBy   String?
  validatedAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([type, status])
  @@index([domainId])
  @@index([language])
  @@map("content_items")
}

enum ContentType {
  ACTIVITY
  QUESTION
  STORY
  SCENARIO
  HINT
  EXPLANATION
  PROJECT_BRIEF
  PRACTICE_SET
}

enum ContentStatus {
  DRAFT
  VALIDATING
  VALIDATED
  PUBLISHED
  DEPRECATED
  REJECTED
}
```

### Multilingual Support (NEW)

```prisma
model Translation {
  id         String @id @default(uuid())
  entityType String
  entityId   String
  field      String
  language   String // "en", "ar", "ar-EG"
  value      String @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([entityType, entityId, field, language])
  @@index([entityType, entityId])
  @@index([language])
  @@map("translations")
}
```

### Learning Events (NEW)

```prisma
model LearningEvent {
  id         String   @id @default(uuid())
  learnerId  String
  type       LearningEventType
  entityType String?
  entityId   String?
  data       Json?
  sessionId  String?
  createdAt  DateTime @default(now())

  @@index([learnerId])
  @@index([type])
  @@index([createdAt])
  @@index([sessionId])
  @@map("learning_events")
}

enum LearningEventType {
  ACTIVITY_STARTED
  ACTIVITY_COMPLETED
  ANSWER_SUBMITTED
  HINT_REQUESTED
  HINT_USED
  EXPLANATION_REQUESTED
  SKILL_PRACTICED
  MASTERY_CHANGED
  PROJECT_STARTED
  PROJECT_MILESTONE
  PROJECT_SUBMITTED
  REVIEW_COMPLETED
  RECOMMENDATION_GENERATED
  RECOMMENDATION_ACCEPTED
  RECOMMENDATION_REJECTED
  CONVERSATION_STARTED
  MISSION_STARTED
  MISSION_COMPLETED
}
```

### Character Context (NEW)

```prisma
model CharacterInteraction {
  id           String   @id @default(uuid())
  learnerId    String
  characterId  String
  type         String   // "greeting", "hint", "explanation", "celebration"
  context      Json?    // missionId, activityId, objectiveId
  message      String   @db.Text
  mood         String?
  createdAt    DateTime @default(now())

  @@index([learnerId])
  @@index([characterId])
  @@index([createdAt])
  @@map("character_interactions")
}
```

---

## Models to Extend (Existing)

### Skill — Add prerequisite self-relation
```prisma
// Add to Skill model:
  prerequisiteSkillIds String[] // self-referential via array
  relatedSkillIds      String[]
```

### Activity — Add mission link and age band
```prisma
// Add to Activity model:
  ageBands    AgeBand[]
  missionActivities MissionActivity[]
```

### Mission — Add domain linkage
```prisma
// Add to Mission model:
  domainId   String?
  ageBands   AgeBand[]
  missionActivities MissionActivity[]
```

### Domain — Add learning paths
```prisma
// Add to Domain model:
  learningPaths LearningPath[]
```

---

## Total Proposed Schema: ~30 Models

| Category | Existing | New | Total |
|----------|----------|-----|-------|
| Identity | 4 | 0 | 4 |
| Curriculum | 5 | 4 (Concept, Prerequisite, LearningPath, PathNode) | 9 |
| Mastery | 2 | 0 | 2 |
| Missions | 3 | 1 (MissionActivity) | 4 |
| Projects | 1 | 0 | 1 |
| Progression | 3 | 0 | 3 |
| Characters/AI | 4 | 1 (CharacterInteraction) | 5 |
| Content | 0 | 2 (ContentItem, Translation) | 2 |
| Platform | 0 | 2 (AgeVariant, LearningEvent) | 2 |
| **Total** | **22** | **10** | **32** |

---

## Migration Strategy

1. All new models are ADDITIVE — no existing table modifications that break running code
2. MissionActivity is a new linking table — existing code continues working until migrated
3. Skill.prerequisiteSkillIds is an array field addition — non-breaking
4. Age variants are optional overlays — activities work without them
