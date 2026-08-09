# Backend Integration Guide

## 🎯 Purpose

This guide helps backend developers integrate with the USAM Learning Worlds frontend. The frontend is **100% complete and ready** - it just needs real API endpoints to replace the current mock implementations.

---

## 📋 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/mohamedsaber3108/USAM-Learning-Worlds
cd USAM-Learning-Worlds
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` with mock data.

### 2. Understand the Architecture

```
┌─────────────────────────────────────────────┐
│              UI Components                   │
│   (110+ components, 40+ routes)             │
└─────────────────┬───────────────────────────┘
                  │
                  │ ONLY talks to ↓
                  │
┌─────────────────▼───────────────────────────┐
│           Service Layer                      │
│   (17 service interfaces)                   │
│   - Today: Mock implementations             │
│   - Tomorrow: Real API calls                │
└─────────────────┬───────────────────────────┘
                  │
                  │ HTTP/GraphQL/gRPC ↓
                  │
┌─────────────────▼───────────────────────────┐
│          Backend API (YOU BUILD THIS)       │
│   - Authentication                          │
│   - Database                                │
│   - Business Logic                          │
│   - AI Integration                          │
└─────────────────────────────────────────────┘
```

### 3. Find the Contracts

All TypeScript interfaces you need to implement:

- **Entity Types**: `src/types/*.ts` (16 files, 100+ entities)
- **Service Interfaces**: `src/services/contracts.ts` (17 services)
- **Request/Response DTOs**: `src/services/contracts.ts` (30+ DTOs)
- **Mock Implementations**: `src/services/index.ts` (reference implementation)

### 4. Swap One Service at a Time

Example: Replacing learner service

**Before (Mock):**
```typescript
// src/services/index.ts
export const learnerService = {
  getCurrent: (): Promise<Learner> => respond(mockLearner),
};
```

**After (Real API):**
```typescript
// src/services/index.ts
export const learnerService = {
  getCurrent: async (): Promise<Learner> => {
    const response = await fetch("/api/learner/current", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw await parseError(response);
    return response.json();
  },
};
```

**That's it!** No component changes needed.

---

## 🔌 Service Interfaces

### 1. AuthService

**Endpoints to implement:**

- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/refresh` - Refresh session token

**What it needs:**
- JWT or session-based auth
- Role-based access (learner/parent/educator)
- Permission system

**Frontend expectations:**
```typescript
interface AuthSession {
  status: "authenticated" | "anonymous" | "loading";
  learnerId: ID | null;
  role: "learner" | "parent" | "educator";
  permissions: string[];
}
```

### 2. LearnerService

**Endpoints to implement:**

- `GET /api/learner/current` - Get current learner
- `GET /api/learner/context` - Get learner context
- `GET /api/learner/customization` - Get avatar customization
- `GET /api/learner/inventory` - Get inventory items
- `PATCH /api/learner/profile` - Update profile
- `PATCH /api/learner/customization` - Update customization

**What it needs:**
- User profile storage
- Avatar customization persistence
- Inventory management

### 3. CurriculumService

**Endpoints to implement:**

- `GET /api/curriculum/domains` - List all domains
- `GET /api/curriculum/domains/:id` - Get domain by ID
- `GET /api/curriculum/skills?domainId=X` - List skills
- `GET /api/curriculum/skills/:id` - Get skill by ID
- `GET /api/curriculum/competencies?skillIds=X,Y` - List competencies
- `GET /api/curriculum/objectives` - List objectives
- `GET /api/curriculum/skill-graph/:domainId` - Get skill dependency graph

**What it needs:**
- Curriculum content management
- Skill dependency graph
- Age-band filtering

### 4. MasteryService

**Endpoints to implement:**

- `GET /api/mastery/records` - List mastery records
- `GET /api/mastery/records/:competencyId` - Get mastery record
- `POST /api/mastery/evidence` - Record evidence
- `GET /api/mastery/progress` - List progress records
- `GET /api/mastery/achievements` - List achievements
- `GET /api/mastery/skills/:skillId/status` - Get skill status

**What it needs:**
- Mastery tracking database
- Evidence processing
- **Confidence calculation (adaptive engine)** - CRITICAL
- Spaced repetition scheduling
- Achievement unlocking

**CRITICAL - Mastery Confidence Algorithm:**

The frontend expects a `confidence` score (0-1) for each competency. You need an **adaptive engine** that:

1. **Tracks evidence over time** (8 evidence types)
2. **Calculates confidence** based on:
   - Recency of practice
   - Success rate
   - Evidence diversity (multiple types)
   - Spacing of practice (distributed > cramming)
3. **Adjusts difficulty** based on confidence
4. **Schedules spaced review** when confidence decays

**Suggested algorithms:**
- Item Response Theory (IRT)
- Bayesian Knowledge Tracing (BKT)
- Performance Factor Analysis (PFA)
- Or custom weighted heuristics

**Minimum viable algorithm:**
```python
def calculate_confidence(competency_id):
    evidence = get_evidence(competency_id, last_30_days=True)
    
    if not evidence:
        return 0.0
    
    # Success rate
    success_rate = sum(e.success for e in evidence) / len(evidence)
    
    # Recency bonus
    days_since_last = (now - evidence[0].timestamp).days
    recency_factor = max(0, 1 - (days_since_last / 14))  # Decay over 2 weeks
    
    # Diversity bonus (multiple evidence types)
    evidence_types = set(e.type for e in evidence)
    diversity_factor = min(len(evidence_types) / 8, 1.0)
    
    # Combine
    confidence = (
        success_rate * 0.5 +
        recency_factor * 0.3 +
        diversity_factor * 0.2
    )
    
    return confidence
```

### 5. ProjectService

**Endpoints to implement:**

- `GET /api/projects?state=X` - List projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/submit` - Submit for review
- `POST /api/projects/:id/milestones` - Add milestone
- `POST /api/projects/:id/artifacts` - Add artifact (with file upload)
- `POST /api/projects/:id/reflections` - Add reflection

**What it needs:**
- Project storage
- **File upload** (S3/GCS/similar) for artifacts
- Review workflow
- Milestone tracking
- Privacy controls
- Parent approval workflow

### 6. ProgressionService

**Endpoints to implement:**

- `GET /api/progression/level` - Get current level
- `GET /api/progression/xp` - Get XP history
- `GET /api/progression/coins` - Get coins balance
- `POST /api/progression/coins/spend` - Spend coins
- `GET /api/progression/streak` - Get practice streak
- `GET /api/progression/achievements` - List achievements
- `GET /api/progression/leaderboard/:scope` - Get leaderboard
- `POST /api/progression/leaderboard/opt-in` - Opt in
- `POST /api/progression/leaderboard/opt-out` - Opt out

**What it needs:**
- XP calculation engine
- Level progression logic
- Coin economy
- **Streak tracking (weekly reset, NOT daily)** - CRITICAL
- Achievement unlocking
- Leaderboard aggregation (**opt-in only**)

**CRITICAL - Ethical Progression Rules:**

1. **XP Sources (ONLY these):**
   - Completing activities (base XP)
   - Demonstrating evidence (bonus)
   - Mastering skills (major milestone)
   - Completing projects (creation bonus)
   - Helping others (community bonus)
   - Reflection sessions (metacognition bonus)

2. **NOT XP Sources (NEVER these):**
   - ❌ Daily login
   - ❌ Time spent
   - ❌ Clicking around
   - ❌ Watching videos
   - ❌ Opening the app

3. **Streak Rules:**
   - **Weekly reset** (not daily)
   - NO "streak broken" messages
   - NO loss language
   - Positive framing only

4. **Leaderboard Rules:**
   - **Opt-in only** (default: off)
   - Can hide at any time
   - Class/guild scope only (no global)
   - Multiple metrics (not just XP)

### 7. CommunityService

**Endpoints to implement:**

- `GET /api/community/teams` - List teams
- `GET /api/community/teams/:id` - Get team
- `POST /api/community/teams/:id/join` - Join team
- `POST /api/community/teams/:id/leave` - Leave team
- `GET /api/community/guilds` - List guilds
- `POST /api/community/messages` - Send message
- `GET /api/community/messages/:contextId` - List messages
- `GET /api/community/showcases` - List showcases
- `POST /api/community/showcases` - Create showcase
- `POST /api/community/showcases/:id/react` - React to showcase
- `GET /api/community/challenges` - List challenges
- `GET /api/community/events` - List events

**What it needs:**
- Group membership management
- **Message moderation queue** - CRITICAL
- Showcase moderation
- Challenge tracking
- Event registration
- **Age-based access enforcement** - CRITICAL

**CRITICAL - Communication Safety:**

1. **NO unrestricted messaging**
   - Structured templates only
   - All moderated before delivery
   - Context-bound (team/guild/project)
   - Parent visibility

2. **Moderation Requirements:**
   - Every message reviewed (auto or human)
   - States: draft → pending → approved/rejected
   - Transparent timing ("a few minutes")
   - Clear feedback if rejected

### 8. ModerationService

**Endpoints to implement:**

- `POST /api/moderation/submit` - Submit content for review
- `GET /api/moderation/status/:contentId` - Get moderation status
- `GET /api/moderation/pending` - List pending reviews (admin)
- `POST /api/moderation/reports` - Submit report
- `GET /api/moderation/reports/:userId` - List reports
- `POST /api/moderation/block` - Block user
- `POST /api/moderation/unblock/:userId` - Unblock user
- `GET /api/moderation/blocked` - List blocked users

**What it needs:**
- Moderation queue system
- **Auto-moderation (ML filters)** - Recommended
- Human review workflow
- Report management
- Block enforcement
- Audit logs

**CRITICAL - Safety Infrastructure:**

1. **Auto-Moderation (ML):**
   - Flag inappropriate content
   - Detect bullying language
   - Identify personal info (addresses, phone numbers)
   - Check against profanity lists
   - Score content risk (low/medium/high)

2. **Human Review:**
   - Queue for flagged content
   - Review interface for moderators
   - Approve/reject/escalate actions
   - Feedback to users

3. **Reporting:**
   - Private reporting
   - Multiple report reasons
   - Urgent escalation for serious issues
   - Parent notification

### 9. ParentService

**Endpoints to implement:**

- `GET /api/parent/dashboard/:childId` - Get dashboard
- `GET /api/parent/reports/weekly/:childId` - Get weekly report
- `GET /api/parent/reports/monthly/:childId?month=X` - Get monthly report
- `GET /api/parent/reports/milestones/:childId` - List milestone reports
- `GET /api/parent/controls/:childId` - Get parental controls
- `PATCH /api/parent/controls/:childId` - Update controls
- `GET /api/parent/approvals/:childId` - List pending approvals
- `POST /api/parent/approvals/:itemId/approve` - Approve item
- `POST /api/parent/approvals/:itemId/deny` - Deny item
- `GET /api/parent/safety/:childId` - Get safety dashboard

**What it needs:**
- Parent-child relationship management
- **Observation insight generation** - CRITICAL
- Report generation (weekly/monthly/milestone)
- Approval workflow
- Safety metrics aggregation
- Privacy-respecting activity logs

**CRITICAL - Parent Language Guidelines:**

1. **ALWAYS Use (Observation-based):**
   - ✅ "Your child has spent time on..."
   - ✅ "Based on completing 8 challenges..."
   - ✅ "Practice may be helpful..."
   - ✅ "Your child appears to engage more with..."

2. **NEVER Use (Diagnostic):**
   - ❌ "Your child has ADHD"
   - ❌ "Your child is gifted"
   - ❌ "Your child has low intelligence"
   - ❌ "Your child is struggling"
   - ❌ "Your child is behind"

3. **Privacy Rules:**
   - Show activity patterns, NOT full conversations
   - Show message counts, NOT message content
   - Show time spent, NOT every click
   - Balance: Safety visibility + child privacy

### 10. AIService

**Endpoints to implement:**

- `GET /api/ai/conversation/:id?` - Get conversation
- `POST /api/ai/conversation/:id/message` - Send message
- `POST /api/ai/conversation/:id/stream` - Stream message (SSE/WebSocket)
- `GET /api/ai/recommendations` - List recommendations
- `GET /api/ai/hints/:objectiveId` - Get hints
- `POST /api/ai/explain/:conceptId` - Generate explanation

**What it needs:**
- **LLM integration** (OpenAI/Anthropic/other)
- Streaming support (SSE or WebSocket)
- Conversation persistence
- **Age-appropriate tone adaptation** - CRITICAL
- Safety filtering
- Context-aware recommendations
- Hint ladder generation

**CRITICAL - AI Safety:**

1. **Input Filtering:**
   - Block attempts to jailbreak
   - Flag inappropriate prompts
   - Detect personal info sharing

2. **Output Filtering:**
   - Age-appropriate language
   - No harmful content
   - No medical/legal advice
   - Educational focus only

3. **Tone Adaptation by Age:**
   - **8-9**: Simple, playful, encouraging
   - **10-11**: Balanced, descriptive
   - **12-14**: More sophisticated, respectful

### 11-17. Other Services

See `src/services/contracts.ts` for complete interfaces:

- **WorldService** - World content and progress
- **MissionService** - Mission content and completion
- **AdaptiveService** - Difficulty adjustment
- **VoiceService** - Speech-to-text and text-to-speech
- **ContentService** - Stories, simulations, drills
- **AnalyticsService** - Learning analytics
- **SafetyService** - Safety settings

---

## 📦 Request/Response DTOs

### Example: Create Project

**Request:**
```typescript
POST /api/projects

{
  "title": "Build a Calculator",
  "goal": "Learn arithmetic operations through coding",
  "domainIds": ["coding", "math"],
  "skillIds": ["variables", "functions", "arithmetic"],
  "visibility": "private",
  "ageBand": "10-11"
}
```

**Response:**
```typescript
201 Created

{
  "id": "proj-abc123",
  "title": "Build a Calculator",
  "goal": "Learn arithmetic operations through coding",
  "domainIds": ["coding", "math"],
  "skillIds": ["variables", "functions", "arithmetic"],
  "state": "idea",
  "visibility": "private",
  "ageBand": "10-11",
  "createdAt": "2026-08-09T10:00:00Z",
  "updatedAt": "2026-08-09T10:00:00Z",
  "progress": 0,
  "milestones": [],
  "artifacts": [],
  "reflections": []
}
```

### Example: Record Evidence

**Request:**
```typescript
POST /api/mastery/evidence

{
  "competencyId": "comp-loops-basic",
  "evidenceType": "application",
  "description": "Successfully used for-loop to iterate array in coding challenge",
  "activityId": "act-loop-practice-3",
  "timestamp": "2026-08-09T10:30:00Z"
}
```

**Response:**
```typescript
200 OK

{
  "competencyId": "comp-loops-basic",
  "masteryState": "developing",
  "confidence": 0.72,
  "evidenceCount": 6,
  "nextReviewAt": "2026-08-12T10:30:00Z"
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User signs in** → `POST /api/auth/signin`
2. **Backend returns token** (JWT or session ID)
3. **Frontend stores token** (localStorage or cookie)
4. **All requests include token** in Authorization header
5. **Backend verifies token** on every request

### Authorization Rules

1. **Age-based access:**
   - 8-9: Limited community features
   - 10-11: More features, parent approval required
   - 12-14: Most features, less supervision

2. **Parent approval:**
   - Join guilds (always)
   - Showcase publicly (if enabled)
   - Give peer feedback (if enabled)
   - Register for events (if enabled)

3. **Moderation:**
   - All user content moderated before visible
   - Flagged content requires human review
   - Inappropriate content blocked immediately

### Permission System

```typescript
// Example permissions
const permissions = [
  "learn:read",          // View learning content
  "learn:write",         // Submit activities
  "project:read",        // View own projects
  "project:write",       // Create/edit projects
  "community:read",      // View community content
  "community:write",     // Participate in community
  "parent:read",         // View child's data (parents only)
  "parent:write",        // Update settings (parents only)
  "moderate:read",       // View moderation queue (moderators only)
  "moderate:write",      // Review content (moderators only)
];
```

---

## 🗄️ Database Schema

### Core Tables

**learners**
- id (PK)
- email
- password_hash
- display_name
- age
- age_band
- avatar_character_id
- world_id
- current_mission_id
- guild_id
- joined_at
- parent_approved

**domains**
- id (PK)
- name
- short_name
- description
- glyph
- accent_color
- order

**skills**
- id (PK)
- domain_id (FK)
- name
- description
- level
- order

**competencies**
- id (PK)
- skill_id (FK)
- name

**mastery_records**
- id (PK)
- learner_id (FK)
- competency_id (FK)
- state (enum: not-started, introduced, exploring, etc.)
- confidence (0-1)
- evidence_count
- last_practiced_at
- next_review_at

**evidence**
- id (PK)
- learner_id (FK)
- competency_id (FK)
- type (enum: knowledge, application, creation, etc.)
- description
- activity_id (FK, nullable)
- project_id (FK, nullable)
- artifact_url
- timestamp

**projects**
- id (PK)
- learner_id (FK)
- title
- goal
- state (enum: idea, planning, building, etc.)
- visibility (enum: private, family, community)
- progress (0-100)
- created_at
- updated_at

**project_milestones**
- id (PK)
- project_id (FK)
- title
- description
- completed
- target_date
- completed_at
- order

**project_artifacts**
- id (PK)
- project_id (FK)
- title
- description
- file_url
- file_type
- thumbnail_url
- uploaded_at

**xp_gains**
- id (PK)
- learner_id (FK)
- source (enum: activity, evidence, skill, project, etc.)
- amount
- reason
- timestamp

**achievements**
- id (PK)
- learner_id (FK)
- title
- evidence
- competency_id (FK)
- earned_at

**messages**
- id (PK)
- from_learner_id (FK)
- context_type (enum: team, guild, feedback, project)
- context_id
- template_id
- template_values (JSON)
- content (generated from template)
- moderation_state (enum: draft, pending, approved, etc.)
- submitted_at
- reviewed_at
- reviewed_by
- sent_at

**reports**
- id (PK)
- reported_by_learner_id (FK)
- target_type (enum: content, user, conversation)
- target_id
- reason (enum: inappropriate-content, bullying, etc.)
- description
- status (enum: submitted, reviewing, resolved, dismissed)
- submitted_at
- resolved_at

**blocked_users**
- id (PK)
- blocker_learner_id (FK)
- blocked_learner_id (FK)
- reason
- blocked_at

**parental_controls**
- id (PK)
- child_id (FK to learners)
- parent_id (FK to learners)
- community_enabled
- can_join_groups
- can_showcase_publicly
- can_give_peer_feedback
- require_approval_for (JSON array)
- notify_parent_for (JSON array)

### Indexes

```sql
-- Mastery lookups
CREATE INDEX idx_mastery_learner_competency ON mastery_records(learner_id, competency_id);
CREATE INDEX idx_mastery_next_review ON mastery_records(learner_id, next_review_at);

-- Evidence lookups
CREATE INDEX idx_evidence_learner_timestamp ON evidence(learner_id, timestamp DESC);
CREATE INDEX idx_evidence_competency ON evidence(competency_id);

-- Project lookups
CREATE INDEX idx_projects_learner_state ON projects(learner_id, state);

-- Message moderation
CREATE INDEX idx_messages_moderation ON messages(moderation_state, submitted_at);

-- Reports
CREATE INDEX idx_reports_status ON reports(status, submitted_at);
```

---

## 🔄 State Management

### Frontend Caching (React Query)

The frontend uses React Query for caching. You need to understand:

1. **Stale time** - How long data is fresh
2. **Cache time** - How long unused data is kept
3. **Refetch on focus** - Refetch when window regains focus
4. **Invalidation** - When to mark data as stale

### Cache Invalidation Rules

When backend event happens → invalidate these queries:

**User completes mission:**
```typescript
invalidate: [
  queryKeys.missions(),
  queryKeys.progress,
  queryKeys.achievements,
  queryKeys.xpHistory,
  queryKeys.level,
]
```

**User submits evidence:**
```typescript
invalidate: [
  queryKeys.masteryRecord(competencyId),
  queryKeys.skillStatus(skillId),
  queryKeys.progress,
]
```

**Parent updates controls:**
```typescript
invalidate: [
  queryKeys.parentalControls(childId),
  queryKeys.safetySettings(childId),
]
```

**Content approved by moderator:**
```typescript
invalidate: [
  queryKeys.contentStatus(contentId),
  queryKeys.messages(contextId),  // if message
  queryKeys.showcases(),           // if showcase
]
```

### Optimistic Updates

For better UX, frontend does optimistic updates on:

- Add milestone to project
- Mark notification as read
- React to showcase
- Update profile

Backend must support idempotent operations.

---

## 🚨 Error Handling

### Error Response Format

**Standard error response:**
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no body
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (already exists)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Temporary downtime

### Error Codes

Use codes from `src/hooks/use-api-state.ts`:

```typescript
const ERROR_CODES = {
  // Network
  NETWORK_ERROR,
  TIMEOUT,
  OFFLINE,
  
  // Auth
  UNAUTHORIZED,
  AUTH_REQUIRED,
  SESSION_EXPIRED,
  
  // Authorization
  FORBIDDEN,
  INSUFFICIENT_PERMISSIONS,
  AGE_RESTRICTED,
  PARENT_APPROVAL_REQUIRED,
  
  // Resources
  NOT_FOUND,
  ALREADY_EXISTS,
  CONFLICT,
  
  // Validation
  INVALID_INPUT,
  VALIDATION_ERROR,
  MISSING_REQUIRED_FIELD,
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED,
  TOO_MANY_REQUESTS,
  
  // Safety
  CONTENT_FLAGGED,
  MODERATION_REQUIRED,
  BLOCKED_USER,
  INAPPROPRIATE_CONTENT,
  
  // Server
  INTERNAL_ERROR,
  SERVICE_UNAVAILABLE,
  MAINTENANCE_MODE,
};
```

Frontend will display user-friendly messages based on error codes.

---

## 📊 Analytics & Logging

### Events to Track

**Learning events:**
- Activity started
- Activity completed
- Evidence submitted
- Skill mastered
- Mission completed
- Project milestone reached

**Engagement events:**
- Session started
- Session ended
- World visited
- Character interaction
- Help requested
- Hint viewed

**Community events:**
- Team joined
- Guild joined
- Message sent
- Showcase created
- Challenge joined
- Event registered

**Safety events:**
- Content flagged
- Report submitted
- User blocked
- Parent approval requested
- Moderation action taken

### Logging

**Required logs:**
- All API requests (method, path, user, timestamp, duration)
- All authentication attempts
- All authorization failures
- All moderation actions
- All safety incidents
- All errors (with stack traces)

**Log retention:**
- Access logs: 90 days
- Safety logs: 2 years (compliance)
- Error logs: 30 days
- Audit logs: 7 years (compliance)

---

## 🧪 Testing

### Testing the Integration

1. **Unit tests** for each service method
2. **Integration tests** for each API endpoint
3. **End-to-end tests** for critical flows:
   - Sign up → onboarding → first mission
   - Complete activity → evidence recorded → mastery updated
   - Create project → add artifacts → submit for review
   - Parent approves → child accesses feature
   - Report submitted → content moderated → resolution

### Testing Tools

Frontend includes:
- TypeScript type checking
- ESLint for code quality
- React component tests (to be added)

Backend should include:
- Unit tests (Jest/pytest/etc.)
- Integration tests (Supertest/requests/etc.)
- Load tests (k6/JMeter/etc.)
- Security tests (OWASP ZAP/etc.)

---

## 🚀 Deployment

### Environment Variables

**Frontend needs:**
```bash
VITE_API_BASE_URL=https://api.usam.com
VITE_API_TIMEOUT=30000
VITE_ENABLE_MOCK=false
```

**Backend needs:**
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
LLM_API_KEY=...
S3_BUCKET=...
SMTP_HOST=...
SENTRY_DSN=...
```

### Deployment Steps

1. **Staging first**
   - Deploy backend to staging
   - Point frontend to staging API
   - Run integration tests
   - Manual QA

2. **Production**
   - Deploy backend to production
   - Update frontend API URL
   - Deploy frontend
   - Monitor errors

3. **Rollback plan**
   - Keep previous backend version running
   - If issues, switch frontend back to previous API
   - Fix and redeploy

---

## 📚 Resources

### Documentation Files

- **PHASE_12_IMPLEMENTATION.md** - Mastery, Skills & Assessment
- **PHASE_13_IMPLEMENTATION.md** - Projects & Portfolio
- **PHASE_14_IMPLEMENTATION.md** - Progression & Game System
- **PHASE_15_IMPLEMENTATION.md** - Safe Community
- **PHASE_16_IMPLEMENTATION.md** - Parent Experience
- **PHASE_17_IMPLEMENTATION.md** - Backend-Ready Frontend Contracts

### Code Files

- **src/types/*.ts** - All entity types
- **src/services/contracts.ts** - All service interfaces and DTOs
- **src/services/index.ts** - Mock implementation (reference)
- **src/hooks/use-api-state.ts** - State management utilities

### Support

- GitHub Issues: https://github.com/mohamedsaber3108/USAM-Learning-Worlds/issues
- Create issue with tag `backend-integration` for questions

---

## ✅ Integration Checklist

### Phase 1: Core Services (MVP)

- [ ] AuthService - Sign in/out
- [ ] LearnerService - Get current learner
- [ ] CurriculumService - List domains/skills
- [ ] WorldService - List worlds
- [ ] MissionService - Get missions, activities
- [ ] MasteryService - List mastery records
- [ ] Deploy to staging
- [ ] Test critical flows

### Phase 2: Progression & Projects

- [ ] ProgressionService - XP, levels, achievements
- [ ] ProjectService - CRUD projects, file upload
- [ ] AdaptiveService - Difficulty adjustment
- [ ] Deploy to staging
- [ ] Test progression flows

### Phase 3: Community & Safety

- [ ] CommunityService - Teams, guilds, messages
- [ ] ModerationService - Content review, reporting
- [ ] SafetyService - Settings, content checks
- [ ] Deploy to staging
- [ ] Test safety features

### Phase 4: Parent & AI

- [ ] ParentService - Dashboard, reports, controls
- [ ] AIService - Conversations, recommendations
- [ ] ContentService - Stories, simulations
- [ ] AnalyticsService - Event tracking
- [ ] Deploy to staging
- [ ] Test all features

### Phase 5: Production

- [ ] Performance testing
- [ ] Security testing
- [ ] Load testing
- [ ] Deploy to production
- [ ] Monitor for 48 hours
- [ ] Celebrate! 🎉

---

*Ready to build? Start with Phase 1, test thoroughly, then move to next phase.*

*Questions? Create a GitHub issue with tag `backend-integration`.*
