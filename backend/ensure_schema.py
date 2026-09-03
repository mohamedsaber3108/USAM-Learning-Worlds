import re

path = "/home/ubuntu/projects/USAM-Learning-Worlds/backend/prisma/schema.prisma"
with open(path) as f:
    content = f.read()

changed = False

# 1. Mission.world relation + index (only add if missing)
if "world             World?             @relation(fields: [worldId], references: [id]" not in content:
    m = re.search(r'(model Mission \{\n(?:.*\n)*?)(\n  runs              MissionRun\[\]\n  missionActivities MissionActivity\[\]\n\n  @@index\(\[type\]\)\n)(  @@map\("missions"\)\n\})', content)
    if m:
        before, mid, after = m.group(1), m.group(2), m.group(3)
        new_mid = '\n  world             World?             @relation(fields: [worldId], references: [id], onDelete: SetNull)\n  runs              MissionRun[]\n  missionActivities MissionActivity[]\n\n  @@index([type])\n  @@index([worldId])\n'
        content = content[:m.start()] + before + new_mid + after + content[m.end():]
        changed = True
        print("Added Mission.world relation")
    else:
        print("WARN: could not locate Mission block for world relation patch")

# 2. World model itself
if "model World {" not in content:
    world_block = '''
// ==================== World Engine / World State Engine ====================
// Zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b — before this
// pass, `Mission.worldId` was a nullable, unindexed, unvalidated free string
// with no World model, no FK, no relation, no seed data, no controller
// route, and no frontend reference. Built from scratch this pass: a real
// World model that Mission.worldId now genuinely references (migrated from
// free string to FK), one World per major Domain (a "zone" learners travel
// to for that subject), and a real per-learner unlock-status signal reusing
// the same domain-engagement pattern character.service.ts's
// getUnlockedCharactersForLearner() established (getDomainEngagementSet()).
model World {
  id              String   @id @default(uuid())
  name            String   @unique
  slug            String   @unique
  description     String?
  domainId        String
  unlockCondition String
  order           Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  domain   Domain    @relation(fields: [domainId], references: [id], onDelete: Cascade)
  missions Mission[]

  @@index([domainId])
  @@index([slug])
  @@map("worlds")
}
'''
    idx = content.find('enum MissionType {')
    if idx != -1:
        content = content[:idx] + world_block.lstrip('\n') + '\n' + content[idx:]
        changed = True
        print("Added World model")
    else:
        content += world_block
        changed = True
        print("Added World model (appended at end, enum MissionType not found)")

# 3. Domain relations for worlds/creativityPrompts
if re.search(r'model Domain \{(?:(?!\}).)*?\}', content, re.S):
    dom_match = re.search(r'(model Domain \{(?:(?!\n\}).)*?\n)(\n  @@index\(\[slug\]\)\n  @@map\("domains"\)\n\})', content, re.S)
    if dom_match and "worlds            World[]" not in dom_match.group(1) and "worlds World[]" not in dom_match.group(1):
        body = dom_match.group(1)
        if not body.rstrip().endswith('[]') and 'worlds' not in body:
            new_body = body.rstrip('\n') + '\n  worlds            World[]\n  creativityPrompts CreativityPrompt[]\n'
            content = content[:dom_match.start(1)] + new_body + dom_match.group(2) + content[dom_match.end():]
            changed = True
            print("Added Domain.worlds/creativityPrompts relations")
    else:
        print("Domain relations already present or pattern mismatch (ok if already present)")

# 4. Learner relation for creativitySubmissions
if "creativitySubmissions CreativitySubmission[]" not in content:
    learner_match = re.search(r'(model Learner \{(?:(?!\n\}).)*?\n)(\n  @@index\(\[userId\]\)\n  @@index\(\[displayName\]\)\n  @@map\("learners"\)\n\})', content, re.S)
    if learner_match:
        body = learner_match.group(1)
        new_body = body.rstrip('\n') + '\n  creativitySubmissions CreativitySubmission[]\n'
        content = content[:learner_match.start(1)] + new_body + learner_match.group(2) + content[learner_match.end():]
        changed = True
        print("Added Learner.creativitySubmissions relation")
    else:
        print("WARN: could not locate Learner block for creativitySubmissions patch")

# 5. CreativityPrompt / CreativitySubmission / ProblemSolvingConcept models (append at end if missing)
tail_block = '''
// ==================== Creativity Engine ====================
// Zero-trace engine per USAM_KIDS_ENGINE_GAP_MATRIX.md ("No model, service,
// or module... nothing dedicated beyond generic Project/ai-task.interface
// enum value"). Built from scratch this pass: a small bank of real
// open-ended creative prompts ("design a poster explaining photosynthesis",
// "write a 4-line poem about your favorite number") spanning multiple
// Domains, plus a lightweight submission+gallery layer. Deliberately a
// dedicated model rather than reusing Project — prompts here are
// curriculum-authored content (like AILiteracyConcept), not learner-authored
// project metadata, and submissions are simple text/note responses to a
// specific prompt rather than a full multi-milestone Project lifecycle.
model CreativityPrompt {
  id          String   @id @default(uuid())
  title       String   @unique
  slug        String   @unique
  prompt      String
  domainId    String?
  ageBand     AgeBand
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  domain      Domain?                @relation(fields: [domainId], references: [id], onDelete: SetNull)
  submissions CreativitySubmission[]

  @@index([slug])
  @@index([domainId])
  @@index([ageBand])
  @@map("creativity_prompts")
}

enum CreativitySubmissionVisibility {
  PRIVATE
  PUBLIC
}

model CreativitySubmission {
  id         String                         @id @default(uuid())
  promptId   String
  learnerId  String
  title      String?
  content    String
  visibility CreativitySubmissionVisibility @default(PRIVATE)
  createdAt  DateTime                       @default(now())

  prompt  CreativityPrompt @relation(fields: [promptId], references: [id], onDelete: Cascade)
  learner Learner          @relation(fields: [learnerId], references: [id], onDelete: Cascade)

  @@index([promptId])
  @@index([learnerId])
  @@index([visibility])
  @@map("creativity_submissions")
}

// ==================== Problem Solving Engine + Computational Thinking Engine ====================
// Both zero-trace per USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b — genuinely
// overlapping (decomposition/pattern-recognition/abstraction/algorithm-design
// underlies both "problem solving" and "computational thinking" as commonly
// taught to kids), so this pass builds ONE model covering both rather than
// two near-duplicate tables. Mirrors AILiteracyConcept/CareerExplorationConcept
// exactly: a flat, age-banded concept table with no relations, served
// read-only via a controller mirroring cross-curricular.controller.ts.
model ProblemSolvingConcept {
  id             String   @id @default(uuid())
  name           String   @unique
  slug           String   @unique
  description    String?
  category       String
  ageAppropriate AgeBand
  order          Int      @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  @@index([slug])
  @@index([category])
  @@map("problem_solving_concepts")
}
'''
if "model CreativityPrompt {" not in content:
    content = content.rstrip('\n') + '\n' + tail_block
    changed = True
    print("Appended CreativityPrompt/CreativitySubmission/ProblemSolvingConcept models")

if changed:
    with open(path, "w") as f:
        f.write(content)
    print("SCHEMA WRITTEN")
else:
    print("No changes needed — schema already has all our additions")
