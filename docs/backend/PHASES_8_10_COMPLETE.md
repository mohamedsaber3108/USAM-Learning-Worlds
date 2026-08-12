# PHASES 8-10: COMPLETE IMPLEMENTATION PROMPTS
## Final Production-Ready Features — Detailed Implementation Guide

**This document contains full implementation prompts for the final production-ready phases.**

**Phases covered:**
- Phase 8: Gamification & Progression (Week 13-15)
- Phase 9: Community & Moderation ⭐ CRITICAL (Week 15-18)
- Phase 10: Parent System & Reports (Week 18-20)

---

# PHASE 8: GAMIFICATION & PROGRESSION (Week 13-15)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 8: GAMIFICATION & PROGRESSION

## CONTEXT

Phases 1-7 complete. Now implement the gamification layer that rewards learners and tracks overall progression.

## CRITICAL REQUIREMENTS

**Two Currency System:**
1. **XP (Experience Points)** — Progress metric, cannot be spent
2. **Coins** — Spendable currency for avatar items

**Privacy-First Leaderboards:**
- Opt-in ONLY
- No real names
- Age band separation

**Progression System:**
- Levels based on total XP
- Achievements unlock at milestones
- Streaks for consistent practice
- Inventory for avatar customization

## PHASE 8 OBJECTIVES

1. Implement XP transaction system
2. Implement Coins economy (earn/spend)
3. Implement Achievement unlock logic
4. Implement Inventory system
5. Implement Privacy-first leaderboards
6. Implement Streak tracking
7. Test complete progression flow

## KEY DELIVERABLES

### 1. Progression Module Structure

```
src/modules/progression/
├── progression.module.ts
├── progression.controller.ts
├── progression.service.ts
├── xp.service.ts
├── coins.service.ts
├── achievement.service.ts
├── inventory.service.ts
├── leaderboard.service.ts
├── streak.service.ts
└── dto/
```

### 2. XP Service (Cannot be spent)

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { XPSource } from '@prisma/client'

@Injectable()
export class XPService {
  constructor(private prisma: PrismaService) {}

  async awardXP(
    learnerId: string,
    amount: number,
    source: XPSource,
    sourceId: string,
    reason: string
  ) {
    // Prevent duplicate XP for same source
    const existing = await this.prisma.xPGain.findUnique({
      where: {
        learnerId_source_sourceId: {
          learnerId,
          source,
          sourceId
        }
      }
    })

    if (existing) {
      return { success: false, reason: 'XP already awarded' }
    }

    // Create XP gain record
    const xpGain = await this.prisma.xPGain.create({
      data: {
        learnerId,
        amount,
        source,
        sourceId,
        reason
      }
    })

    // Update total XP and level
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId }
    })

    const newTotalXP = progression.totalXP + amount
    const newLevel = this.calculateLevel(newTotalXP)
    const leveledUp = newLevel > progression.level

    await this.prisma.progression.update({
      where: { learnerId },
      data: {
        totalXP: newTotalXP,
        level: newLevel
      }
    })

    // If leveled up, check for level-based achievements
    if (leveledUp) {
      await this.checkLevelAchievements(learnerId, newLevel)
    }

    return {
      success: true,
      xpGained: amount,
      totalXP: newTotalXP,
      level: newLevel,
      leveledUp
    }
  }

  private calculateLevel(totalXP: number): number {
    // Formula: level = floor(sqrt(totalXP / 100))
    // Level 1: 100 XP
    // Level 2: 400 XP (+300)
    // Level 3: 900 XP (+500)
    // Level 10: 10,000 XP
    return Math.floor(Math.sqrt(totalXP / 100))
  }

  async getXPToNextLevel(learnerId: string): Promise<number> {
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId }
    })

    const currentLevel = progression.level
    const nextLevel = currentLevel + 1
    const xpNeeded = nextLevel * nextLevel * 100
    const xpRemaining = xpNeeded - progression.totalXP

    return xpRemaining
  }

  private async checkLevelAchievements(learnerId: string, level: number) {
    // Check for level-based achievements (e.g., "Reach Level 5")
    const achievements = await this.prisma.achievement.findMany({
      where: {
        criteria: {
          path: ['type'],
          equals: 'LEVEL_UP'
        }
      }
    })

    for (const achievement of achievements) {
      const requiredLevel = achievement.criteria['level']
      if (level >= requiredLevel) {
        await this.unlockAchievement(learnerId, achievement.id)
      }
    }
  }

  private async unlockAchievement(learnerId: string, achievementId: string) {
    // Implemented in AchievementService
  }
}
```

### 3. Coins Service (Can be spent)

```typescript
import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CoinSource } from '@prisma/client'

@Injectable()
export class CoinsService {
  constructor(private prisma: PrismaService) {}

  async awardCoins(
    learnerId: string,
    amount: number,
    source: CoinSource,
    sourceId: string,
    reason: string
  ) {
    // Create coin gain record
    await this.prisma.coinGain.create({
      data: {
        learnerId,
        amount,
        source,
        sourceId,
        reason
      }
    })

    // Update total coins
    await this.prisma.progression.update({
      where: { learnerId },
      data: {
        coins: {
          increment: amount
        }
      }
    })

    return { success: true, coinsGained: amount }
  }

  async spendCoins(
    learnerId: string,
    amount: number,
    reason: string,
    itemId?: string
  ) {
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId }
    })

    if (progression.coins < amount) {
      throw new BadRequestException('Insufficient coins')
    }

    // Create spend record
    await this.prisma.coinSpend.create({
      data: {
        learnerId,
        amount,
        reason,
        itemId
      }
    })

    // Deduct coins
    await this.prisma.progression.update({
      where: { learnerId },
      data: {
        coins: {
          decrement: amount
        }
      }
    })

    return { success: true, coinsSpent: amount, remaining: progression.coins - amount }
  }

  async getBalance(learnerId: string): Promise<number> {
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId }
    })

    return progression.coins
  }
}
```

### 4. Achievement Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class AchievementService {
  constructor(
    private prisma: PrismaService,
    private coinsService: CoinsService
  ) {}

  async unlockAchievement(learnerId: string, achievementId: string) {
    // Check if already unlocked
    const existing = await this.prisma.achievementUnlock.findUnique({
      where: {
        progressionId_achievementId: {
          progressionId: learnerId,
          achievementId
        }
      }
    })

    if (existing) {
      return { success: false, reason: 'Already unlocked' }
    }

    // Get achievement details
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId }
    })

    // Create unlock record
    await this.prisma.achievementUnlock.create({
      data: {
        progressionId: learnerId,
        achievementId
      }
    })

    // Award coins if achievement has reward
    if (achievement.coinReward > 0) {
      await this.coinsService.awardCoins(
        learnerId,
        achievement.coinReward,
        'ACHIEVEMENT',
        achievementId,
        `Achievement: ${achievement.title}`
      )
    }

    return {
      success: true,
      achievement,
      coinReward: achievement.coinReward
    }
  }

  async checkAchievements(learnerId: string) {
    // Get learner stats
    const progression = await this.prisma.progression.findUnique({
      where: { learnerId },
      include: {
        achievements: true
      }
    })

    const stats = await this.getStats(learnerId)

    // Get all achievements
    const allAchievements = await this.prisma.achievement.findMany()

    const unlockedIds = new Set(progression.achievements.map(a => a.achievementId))
    const toUnlock: string[] = []

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue

      const criteria = achievement.criteria as any
      const meetsRequirement = this.evaluateCriteria(criteria, stats, progression)

      if (meetsRequirement) {
        toUnlock.push(achievement.id)
      }
    }

    // Unlock all eligible achievements
    for (const achievementId of toUnlock) {
      await this.unlockAchievement(learnerId, achievementId)
    }

    return { unlocked: toUnlock.length }
  }

  private async getStats(learnerId: string) {
    // Get various stats needed for achievement checks
    const missionCount = await this.prisma.missionRun.count({
      where: { learnerId, status: 'COMPLETED' }
    })

    const projectCount = await this.prisma.project.count({
      where: { learnerId, state: 'COMPLETED' }
    })

    const masteryCount = await this.prisma.masteryRecord.count({
      where: { learnerId, state: 'MASTERED' }
    })

    const evidenceCount = await this.prisma.evidence.count({
      where: { learnerId }
    })

    const streakDays = await this.getStreakDays(learnerId)

    return {
      missionCount,
      projectCount,
      masteryCount,
      evidenceCount,
      streakDays
    }
  }

  private evaluateCriteria(criteria: any, stats: any, progression: any): boolean {
    const type = criteria.type

    switch (type) {
      case 'LEVEL_UP':
        return progression.level >= criteria.level

      case 'MISSIONS_COMPLETED':
        return stats.missionCount >= criteria.count

      case 'PROJECTS_COMPLETED':
        return stats.projectCount >= criteria.count

      case 'SKILLS_MASTERED':
        return stats.masteryCount >= criteria.count

      case 'STREAK':
        return stats.streakDays >= criteria.days

      default:
        return false
    }
  }

  private async getStreakDays(learnerId: string): Promise<number> {
    const streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId }
    })

    return streak?.currentStreak || 0
  }
}
```

### 5. Inventory Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private coinsService: CoinsService
  ) {}

  async purchaseItem(learnerId: string, itemId: string) {
    // Get item
    const item = await this.prisma.avatarItem.findUnique({
      where: { id: itemId }
    })

    if (!item.purchasable) {
      throw new Error('Item not purchasable')
    }

    // Check if already owned
    const existing = await this.prisma.inventory.findUnique({
      where: {
        learnerId_itemId: {
          learnerId,
          itemId
        }
      }
    })

    if (existing) {
      throw new Error('Already owned')
    }

    // Spend coins
    await this.coinsService.spendCoins(
      learnerId,
      item.cost,
      `Purchased ${item.name}`,
      itemId
    )

    // Add to inventory
    await this.prisma.inventory.create({
      data: {
        learnerId,
        itemId,
        acquiredAt: new Date()
      }
    })

    return { success: true, item }
  }

  async equipItem(learnerId: string, itemId: string) {
    // Verify ownership
    const inventoryItem = await this.prisma.inventory.findUnique({
      where: {
        learnerId_itemId: {
          learnerId,
          itemId
        }
      }
    })

    if (!inventoryItem) {
      throw new Error('Item not owned')
    }

    // Get item category to know what slot to update
    const item = await this.prisma.avatarItem.findUnique({
      where: { id: itemId }
    })

    // Update learner's equipped items
    const updateData = {}
    const category = item.category

    // Example categories: HAT, SHIRT, PANTS, SHOES, ACCESSORY
    if (category === 'HAT') updateData['equippedHat'] = itemId
    if (category === 'SHIRT') updateData['equippedShirt'] = itemId
    // ... etc

    await this.prisma.learner.update({
      where: { id: learnerId },
      data: updateData
    })

    return { success: true }
  }

  async getInventory(learnerId: string) {
    return this.prisma.inventory.findMany({
      where: { learnerId },
      include: { item: true }
    })
  }
}
```

### 6. Leaderboard Service (Privacy-First)

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { AgeBand } from '@prisma/client'

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(ageBand: AgeBand, limit: number = 10) {
    // ONLY include learners who opted in
    const learners = await this.prisma.learner.findMany({
      where: {
        ageBand,
        leaderboardOptIn: true, // ⭐ CRITICAL: opt-in only
        status: 'ACTIVE'
      },
      include: {
        progression: true
      },
      orderBy: {
        progression: {
          totalXP: 'desc'
        }
      },
      take: limit
    })

    return learners.map((learner, index) => ({
      rank: index + 1,
      displayName: learner.displayName, // Never use real name
      level: learner.progression.level,
      totalXP: learner.progression.totalXP,
      avatarUrl: learner.avatarUrl
    }))
  }

  async getRank(learnerId: string): Promise<number | null> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: { progression: true }
    })

    if (!learner.leaderboardOptIn) {
      return null // Not participating
    }

    // Count how many learners have more XP
    const count = await this.prisma.learner.count({
      where: {
        ageBand: learner.ageBand,
        leaderboardOptIn: true,
        progression: {
          totalXP: {
            gt: learner.progression.totalXP
          }
        }
      }
    })

    return count + 1
  }

  async toggleOptIn(learnerId: string, optIn: boolean) {
    await this.prisma.learner.update({
      where: { id: learnerId },
      data: { leaderboardOptIn: optIn }
    })

    return { success: true, optIn }
  }
}
```

### 7. Streak Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class StreakService {
  constructor(private prisma: PrismaService) {}

  async updateStreak(learnerId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId }
    })

    if (!streak) {
      // First practice session
      await this.prisma.practiceStreak.create({
        data: {
          learnerId,
          currentStreak: 1,
          longestStreak: 1,
          lastPracticeDate: today
        }
      })

      return { currentStreak: 1, longestStreak: 1 }
    }

    const lastPractice = new Date(streak.lastPracticeDate)
    lastPractice.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 0) {
      // Already practiced today
      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak
      }
    }

    if (daysDiff === 1) {
      // Consecutive day
      const newStreak = streak.currentStreak + 1
      const newLongest = Math.max(newStreak, streak.longestStreak)

      await this.prisma.practiceStreak.update({
        where: { learnerId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastPracticeDate: today
        }
      })

      return { currentStreak: newStreak, longestStreak: newLongest }
    }

    // Streak broken
    await this.prisma.practiceStreak.update({
      where: { learnerId },
      data: {
        currentStreak: 1,
        lastPracticeDate: today
      }
    })

    return { currentStreak: 1, longestStreak: streak.longestStreak }
  }

  async getStreak(learnerId: string) {
    const streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId }
    })

    return streak || { currentStreak: 0, longestStreak: 0 }
  }
}
```

### 8. Controllers

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ProgressionService } from './progression.service'
import { LeaderboardService } from './leaderboard.service'
import { InventoryService } from './inventory.service'

@Controller('progression')
@UseGuards(JwtAuthGuard)
export class ProgressionController {
  constructor(
    private progressionService: ProgressionService,
    private leaderboardService: LeaderboardService,
    private inventoryService: InventoryService
  ) {}

  @Get()
  async getProgression(@CurrentUser() user: any) {
    return this.progressionService.getProgression(user.id)
  }

  @Get('leaderboard')
  async getLeaderboard(@CurrentUser() user: any) {
    const learner = await this.prisma.learner.findUnique({
      where: { id: user.id }
    })
    return this.leaderboardService.getLeaderboard(learner.ageBand)
  }

  @Post('leaderboard/toggle')
  async toggleLeaderboard(
    @CurrentUser() user: any,
    @Body('optIn') optIn: boolean
  ) {
    return this.leaderboardService.toggleOptIn(user.id, optIn)
  }

  @Post('inventory/purchase')
  async purchaseItem(
    @CurrentUser() user: any,
    @Body('itemId') itemId: string
  ) {
    return this.inventoryService.purchaseItem(user.id, itemId)
  }

  @Post('inventory/equip')
  async equipItem(
    @CurrentUser() user: any,
    @Body('itemId') itemId: string
  ) {
    return this.inventoryService.equipItem(user.id, itemId)
  }

  @Get('inventory')
  async getInventory(@CurrentUser() user: any) {
    return this.inventoryService.getInventory(user.id)
  }
}
```

## DEFINITION OF DONE

- ✅ XP system tracks all sources (no duplicates)
- ✅ Level calculation works (formula validated)
- ✅ Coins can be earned and spent
- ✅ Achievements unlock based on criteria
- ✅ Inventory purchase/equip works
- ✅ Leaderboards are opt-in only
- ✅ Streaks track daily practice
- ✅ Frontend displays progression correctly

## VALIDATION

```bash
# Award XP
curl -X POST http://localhost:3001/api/progression/xp \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source": "MISSION_COMPLETE", "sourceId": "mission-1", "amount": 100}'

# Get leaderboard
curl http://localhost:3001/api/progression/leaderboard \
  -H "Authorization: Bearer TOKEN"

# Purchase item
curl -X POST http://localhost:3001/api/progression/inventory/purchase \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemId": "hat-wizard"}'
```

## NEXT PHASE

**Phase 9: Community & Moderation ⭐ CRITICAL (Week 15-18)**

---

END OF PHASE 8 PROMPT
```

---

# PHASE 9: COMMUNITY & MODERATION ⭐ CRITICAL (Week 15-18)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 9: COMMUNITY & MODERATION ⭐ CRITICAL

## CONTEXT

Phases 1-8 complete. Now implement the community features with CRITICAL child safety protections.

## ⭐ CRITICAL REQUIREMENTS - CHILD SAFETY

**ALL community content MUST be moderated:**
- Messages between learners
- Project comments
- Guild/team descriptions
- Showcase descriptions
- Any user-generated text

**Human moderation queue:**
- AI pre-screens (Phase 5 ModerationService)
- Flagged content goes to human review
- Humans approve/reject
- Zero tolerance for unsafe content

**Privacy protections:**
- No private info sharing (enforced)
- No external links (stripped)
- Display names only (no real names)
- Age-appropriate content

## PHASE 9 OBJECTIVES

1. Implement Guild/Team system
2. Implement safe messaging (moderated)
3. Implement human moderation queue ⭐ CRITICAL
4. Implement project showcases
5. Implement report system
6. Implement block functionality
7. Test complete safety workflow

## KEY DELIVERABLES

### 1. Community Module Structure

```
src/modules/community/
├── community.module.ts
├── guild.controller.ts
├── guild.service.ts
├── messaging.controller.ts
├── messaging.service.ts
├── moderation.controller.ts
├── moderation.service.ts (enhanced from Phase 5)
├── showcase.service.ts
├── report.service.ts
├── block.service.ts
└── dto/
```

### 2. Enhanced ModerationService (Human Review Queue)

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { ModerationStatus, ModerationDecision } from '@prisma/client'

@Injectable()
export class ModerationService {
  constructor(
    private prisma: PrismaService,
    private aiModerationService: AIModerationService // From Phase 5
  ) {}

  async moderateContent(
    content: string,
    contentType: 'MESSAGE' | 'COMMENT' | 'DESCRIPTION',
    authorId: string,
    contextId: string
  ): Promise<ModerationResult> {
    // Step 1: AI pre-screening
    const aiResult = await this.aiModerationService.moderateInput(
      content,
      authorId
    )

    // Step 2: If AI flags, send to human review
    if (aiResult.blocked) {
      const modRecord = await this.prisma.moderation.create({
        data: {
          contentType,
          content,
          authorId,
          contextId,
          status: 'PENDING',
          aiDecision: 'FLAGGED',
          aiReasons: aiResult.reasons
        }
      })

      return {
        approved: false,
        requiresHumanReview: true,
        moderationId: modRecord.id,
        message: 'Your message is being reviewed for safety'
      }
    }

    // Step 3: AI approves, but still log
    await this.prisma.moderation.create({
      data: {
        contentType,
        content,
        authorId,
        contextId,
        status: 'APPROVED',
        aiDecision: 'APPROVED',
        decision: 'APPROVED',
        decidedAt: new Date()
      }
    })

    return {
      approved: true,
      requiresHumanReview: false,
      message: 'Message sent'
    }
  }

  // ⭐ CRITICAL: Human moderator interface
  async getPendingQueue(limit: number = 20) {
    return this.prisma.moderation.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            ageBand: true
          }
        }
      }
    })
  }

  async reviewContent(
    moderationId: string,
    decision: ModerationDecision,
    moderatorId: string,
    notes?: string
  ) {
    const modRecord = await this.prisma.moderation.findUnique({
      where: { id: moderationId }
    })

    // Update moderation record
    await this.prisma.moderation.update({
      where: { id: moderationId },
      data: {
        status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        decision,
        moderatorId,
        moderatorNotes: notes,
        decidedAt: new Date()
      }
    })

    // If approved, publish the content
    if (decision === 'APPROVED') {
      await this.publishContent(modRecord)
    } else {
      // If rejected, notify author (age-appropriate message)
      await this.notifyRejection(modRecord)
    }

    return { success: true }
  }

  private async publishContent(modRecord: any) {
    const { contentType, content, authorId, contextId } = modRecord

    if (contentType === 'MESSAGE') {
      // Update message status to SENT
      await this.prisma.message.update({
        where: { id: contextId },
        data: { status: 'SENT' }
      })
    }

    if (contentType === 'COMMENT') {
      // Publish comment
      await this.prisma.comment.update({
        where: { id: contextId },
        data: { visible: true }
      })
    }

    if (contentType === 'DESCRIPTION') {
      // Approve guild/project description
      // (depends on implementation)
    }
  }

  private async notifyRejection(modRecord: any) {
    // Create notification for learner
    await this.prisma.notification.create({
      data: {
        userId: modRecord.authorId,
        type: 'CONTENT_REJECTED',
        title: 'Message not sent',
        body: 'Your message couldn\'t be sent. Please keep messages friendly and safe.',
        data: { moderationId: modRecord.id }
      }
    })
  }
}
```

### 3. Safe Messaging Service

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService,
    private blockService: BlockService
  ) {}

  async sendMessage(
    senderId: string,
    recipientId: string,
    content: string
  ) {
    // Check if blocked
    const isBlocked = await this.blockService.isBlocked(senderId, recipientId)
    if (isBlocked) {
      throw new ForbiddenException('Cannot send message')
    }

    // Check if recipient has messaging disabled
    const recipient = await this.prisma.learner.findUnique({
      where: { id: recipientId },
      include: {
        guardianships: {
          include: { guardian: true }
        }
      }
    })

    const messagingDisabled = recipient.guardianships.some(g =>
      g.guardian.controls?.disableMessaging
    )

    if (messagingDisabled) {
      throw new ForbiddenException('Recipient has messaging disabled')
    }

    // Create message (pending moderation)
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
        status: 'PENDING_MODERATION'
      }
    })

    // Submit for moderation
    const modResult = await this.moderationService.moderateContent(
      content,
      'MESSAGE',
      senderId,
      message.id
    )

    if (modResult.approved) {
      // Auto-approved by AI
      await this.prisma.message.update({
        where: { id: message.id },
        data: { status: 'SENT' }
      })
    }

    return {
      success: true,
      messageId: message.id,
      requiresReview: modResult.requiresHumanReview
    }
  }

  async getConversation(learnerId: string, otherUserId: string) {
    // Only show SENT messages (approved by moderation)
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: learnerId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: learnerId }
        ],
        status: 'SENT'
      },
      orderBy: { createdAt: 'asc' }
    })
  }
}
```

### 4. Guild Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class GuildService {
  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService
  ) {}

  async createGuild(founderId: string, dto: CreateGuildDto) {
    // Moderate guild name and description
    const nameCheck = await this.moderationService.moderateContent(
      dto.name,
      'DESCRIPTION',
      founderId,
      'guild-name'
    )

    const descCheck = await this.moderationService.moderateContent(
      dto.description,
      'DESCRIPTION',
      founderId,
      'guild-desc'
    )

    if (!nameCheck.approved || !descCheck.approved) {
      return {
        success: false,
        message: 'Guild name or description requires review'
      }
    }

    // Create guild
    const guild = await this.prisma.guild.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        focusDomainId: dto.focusDomainId,
        privacy: dto.privacy,
        maxMembers: dto.maxMembers || 10
      }
    })

    // Add founder as leader
    await this.prisma.guildMembership.create({
      data: {
        guildId: guild.id,
        learnerId: founderId,
        role: 'LEADER'
      }
    })

    return { success: true, guild }
  }

  async joinGuild(learnerId: string, guildId: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        members: true
      }
    })

    if (guild.members.length >= guild.maxMembers) {
      throw new Error('Guild is full')
    }

    if (guild.privacy === 'INVITE_ONLY') {
      // Check for invitation
      const invite = await this.prisma.guildInvite.findFirst({
        where: {
          guildId,
          inviteeId: learnerId,
          status: 'PENDING'
        }
      })

      if (!invite) {
        throw new Error('Invitation required')
      }

      // Accept invite
      await this.prisma.guildInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' }
      })
    }

    // Add member
    await this.prisma.guildMembership.create({
      data: {
        guildId,
        learnerId,
        role: 'MEMBER'
      }
    })

    return { success: true }
  }

  async getGuildMessages(guildId: string, learnerId: string) {
    // Verify membership
    const membership = await this.prisma.guildMembership.findUnique({
      where: {
        guildId_learnerId: {
          guildId,
          learnerId
        }
      }
    })

    if (!membership) {
      throw new ForbiddenException('Not a member')
    }

    // Get approved messages only
    return this.prisma.guildMessage.findMany({
      where: {
        guildId,
        status: 'APPROVED'
      },
      include: {
        author: {
          select: {
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  }
}
```

### 5. Report Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async submitReport(reporterId: string, dto: SubmitReportDto) {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reportedUserId: dto.reportedUserId,
        contentType: dto.contentType,
        contentId: dto.contentId,
        reason: dto.reason,
        description: dto.description,
        status: 'PENDING'
      }
    })

    // Notify moderation team (priority queue)
    await this.notifyModerators(report)

    return { success: true, reportId: report.id }
  }

  async getReportsQueue(limit: number = 50) {
    return this.prisma.report.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        reporter: {
          select: { displayName: true }
        },
        reportedUser: {
          select: { displayName: true, ageBand: true }
        }
      }
    })
  }

  async reviewReport(
    reportId: string,
    moderatorId: string,
    action: 'DISMISSED' | 'WARNING' | 'SUSPEND' | 'BAN',
    notes: string
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId }
    })

    // Update report
    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        moderatorId,
        resolution: action,
        moderatorNotes: notes,
        resolvedAt: new Date()
      }
    })

    // Take action on reported user
    if (action === 'SUSPEND' || action === 'BAN') {
      await this.prisma.user.update({
        where: { id: report.reportedUserId },
        data: {
          status: action === 'SUSPEND' ? 'SUSPENDED' : 'BANNED'
        }
      })
    }

    return { success: true }
  }

  private async notifyModerators(report: any) {
    // Send to moderation dashboard / Slack / email
  }
}
```

### 6. Block Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

  async blockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.create({
      data: {
        blockerId,
        blockedId
      }
    })

    return { success: true }
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId
        }
      }
    })

    return { success: true }
  }

  async isBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: userId }
        ]
      }
    })

    return !!block
  }

  async getBlockedUsers(userId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    })

    return blocks.map(b => b.blocked)
  }
}
```

### 7. Controllers

```typescript
@Controller('community/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MODERATOR', 'ADMIN')
export class ModerationController {
  constructor(
    private moderationService: ModerationService,
    private reportService: ReportService
  ) {}

  @Get('queue')
  async getQueue() {
    return this.moderationService.getPendingQueue()
  }

  @Post('review/:id')
  async reviewContent(
    @Param('id') moderationId: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewDto
  ) {
    return this.moderationService.reviewContent(
      moderationId,
      dto.decision,
      user.id,
      dto.notes
    )
  }

  @Get('reports')
  async getReports() {
    return this.reportService.getReportsQueue()
  }

  @Post('reports/:id/resolve')
  async resolveReport(
    @Param('id') reportId: string,
    @CurrentUser() user: any,
    @Body() dto: ResolveReportDto
  ) {
    return this.reportService.reviewReport(
      reportId,
      user.id,
      dto.action,
      dto.notes
    )
  }
}
```

## DEFINITION OF DONE

- ✅ All community content goes through moderation
- ✅ Human moderation queue functional
- ✅ Messaging requires moderation
- ✅ Guilds can be created and joined
- ✅ Report system captures unsafe content
- ✅ Block functionality prevents interactions
- ✅ Moderator dashboard works
- ✅ Zero unsafe content reaches children

## VALIDATION

```bash
# Send message (should queue for moderation if flagged)
curl -X POST http://localhost:3001/api/community/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": "learner-2", "content": "Hi friend!"}'

# Get moderation queue (moderator only)
curl http://localhost:3001/api/community/moderation/queue \
  -H "Authorization: Bearer MODERATOR_TOKEN"

# Approve content
curl -X POST http://localhost:3001/api/community/moderation/review/mod-1 \
  -H "Authorization: Bearer MODERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision": "APPROVED", "notes": "Safe content"}'
```

## NEXT PHASE

**Phase 10: Parent System & Reports (Week 18-20)**

---

END OF PHASE 9 PROMPT
```

---

# PHASE 10: PARENT SYSTEM & REPORTS (Week 18-20)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 10: PARENT SYSTEM & REPORTS

## CONTEXT

Phases 1-9 complete. Final phase: give parents/guardians visibility and control.

## CRITICAL REQUIREMENTS

**Parent Dashboard:**
- Learning progress summary
- Recent activity timeline
- Mastery visualization
- Community activity (who they interact with)

**Automated Reports:**
- Weekly summary (BullMQ scheduled job)
- Monthly detailed report
- Milestone achievements

**Safety Dashboard:**
- Content moderation history
- Blocked users
- Report history

**Controls:**
- Feature toggles (messaging, community, etc.)
- Approval workflows (public projects)
- Screen time suggestions

## PHASE 10 OBJECTIVES

1. Implement ParentService (dashboard data)
2. Implement automated report generation (BullMQ jobs)
3. Implement safety dashboard
4. Implement approval workflow
5. Implement controls enforcement
6. Test complete parent experience

## KEY DELIVERABLES

### 1. Parent Module Structure

```
src/modules/parent/
├── parent.module.ts
├── parent.controller.ts
├── parent.service.ts
├── report-generator.service.ts
├── dashboard.service.ts
├── controls.service.ts
└── jobs/
    └── weekly-report.processor.ts
```

### 2. Dashboard Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getParentDashboard(guardianId: string) {
    // Get all learners under this guardian
    const guardianships = await this.prisma.guardianship.findMany({
      where: { guardianId },
      include: { learner: true }
    })

    const learnerIds = guardianships.map(g => g.learnerId)

    // Get data for each learner
    const learnerData = await Promise.all(
      learnerIds.map(id => this.getLearnerSummary(id))
    )

    return {
      learners: learnerData,
      pendingApprovals: await this.getPendingApprovals(guardianId)
    }
  }

  private async getLearnerSummary(learnerId: string) {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        progression: true
      }
    })

    // Mastery stats
    const masteryStats = await this.prisma.masteryRecord.groupBy({
      by: ['state'],
      where: { learnerId },
      _count: true
    })

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await this.prisma.evidence.count({
      where: {
        learnerId,
        createdAt: { gte: sevenDaysAgo }
      }
    })

    // Practice streak
    const streak = await this.prisma.practiceStreak.findUnique({
      where: { learnerId }
    })

    // Recent achievements
    const recentAchievements = await this.prisma.achievementUnlock.findMany({
      where: {
        progression: { learnerId },
        unlockedAt: { gte: sevenDaysAgo }
      },
      include: { achievement: true },
      take: 5
    })

    return {
      learner: {
        id: learner.id,
        displayName: learner.displayName,
        firstName: learner.firstName,
        avatarUrl: learner.avatarUrl
      },
      progression: {
        level: learner.progression.level,
        totalXP: learner.progression.totalXP
      },
      mastery: masteryStats,
      activity: {
        last7Days: recentActivity,
        currentStreak: streak?.currentStreak || 0
      },
      recentAchievements: recentAchievements.map(a => a.achievement)
    }
  }

  private async getPendingApprovals(guardianId: string) {
    const guardianships = await this.prisma.guardianship.findMany({
      where: { guardianId },
      select: { learnerId: true }
    })

    const learnerIds = guardianships.map(g => g.learnerId)

    return this.prisma.pendingApproval.findMany({
      where: {
        learnerId: { in: learnerIds },
        status: 'PENDING'
      },
      include: {
        learner: {
          select: {
            displayName: true,
            firstName: true
          }
        }
      }
    })
  }
}
```

### 3. Report Generator Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class ReportGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generateWeeklyReport(learnerId: string) {
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Practice stats
    const evidenceCount = await this.prisma.evidence.count({
      where: {
        learnerId,
        createdAt: { gte: weekAgo }
      }
    })

    const practiceMinutes = await this.calculatePracticeMinutes(learnerId, weekAgo)

    // Missions completed
    const missionsCompleted = await this.prisma.missionRun.count({
      where: {
        learnerId,
        status: 'COMPLETED',
        completedAt: { gte: weekAgo }
      }
    })

    // Skills progress
    const skillsProgressed = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        updatedAt: { gte: weekAgo }
      },
      include: {
        competency: {
          include: { skill: true }
        }
      }
    })

    // Achievements
    const achievements = await this.prisma.achievementUnlock.findMany({
      where: {
        progression: { learnerId },
        unlockedAt: { gte: weekAgo }
      },
      include: { achievement: true }
    })

    // Top skills this week
    const topSkills = skillsProgressed
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(m => ({
        skillName: m.competency.skill.name,
        confidence: m.confidence,
        state: m.state
      }))

    const report = {
      learnerId,
      period: { start: weekAgo, end: now },
      type: 'WEEKLY',
      summary: {
        practiceMinutes,
        evidenceCount,
        missionsCompleted,
        achievementsUnlocked: achievements.length
      },
      topSkills,
      achievements: achievements.map(a => a.achievement),
      generatedAt: now
    }

    // Save report
    await this.prisma.report.create({
      data: {
        learnerId,
        type: 'WEEKLY',
        periodStart: weekAgo,
        periodEnd: now,
        data: report
      }
    })

    return report
  }

  async generateMonthlyReport(learnerId: string) {
    const now = new Date()
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    // More detailed stats for monthly
    const evidenceByType = await this.prisma.evidence.groupBy({
      by: ['type'],
      where: {
        learnerId,
        createdAt: { gte: monthAgo }
      },
      _count: true
    })

    const practiceMinutes = await this.calculatePracticeMinutes(learnerId, monthAgo)

    const skillsMastered = await this.prisma.masteryRecord.count({
      where: {
        learnerId,
        state: 'MASTERED',
        updatedAt: { gte: monthAgo }
      }
    })

    const projectsCompleted = await this.prisma.project.count({
      where: {
        learnerId,
        state: 'COMPLETED',
        updatedAt: { gte: monthAgo }
      }
    })

    // Domain breakdown
    const domainProgress = await this.getDomainProgress(learnerId, monthAgo)

    const report = {
      learnerId,
      period: { start: monthAgo, end: now },
      type: 'MONTHLY',
      summary: {
        practiceMinutes,
        evidenceCount: evidenceByType.reduce((sum, e) => sum + e._count, 0),
        skillsMastered,
        projectsCompleted
      },
      evidenceBreakdown: evidenceByType,
      domainProgress,
      generatedAt: now
    }

    await this.prisma.report.create({
      data: {
        learnerId,
        type: 'MONTHLY',
        periodStart: monthAgo,
        periodEnd: now,
        data: report
      }
    })

    return report
  }

  private async calculatePracticeMinutes(learnerId: string, since: Date): Promise<number> {
    // Sum estimated time from completed activities
    const missions = await this.prisma.missionRun.findMany({
      where: {
        learnerId,
        completedAt: { gte: since }
      },
      include: {
        mission: true
      }
    })

    return missions.reduce((sum, run) => sum + (run.mission.estimatedMinutes || 0), 0)
  }

  private async getDomainProgress(learnerId: string, since: Date) {
    // Get mastery by domain
    const domains = await this.prisma.domain.findMany()
    
    const progress = await Promise.all(
      domains.map(async domain => {
        const masteryCount = await this.prisma.masteryRecord.count({
          where: {
            learnerId,
            competency: {
              skill: { domainId: domain.id }
            },
            state: { in: ['PROFICIENT', 'MASTERED'] }
          }
        })

        return {
          domainName: domain.name,
          skillsProficient: masteryCount
        }
      })
    )

    return progress.filter(p => p.skillsProficient > 0)
  }
}
```

### 4. Weekly Report Job (BullMQ)

```typescript
import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import { ReportGeneratorService } from '../report-generator.service'
import { PrismaService } from '../../../database/prisma.service'

@Processor('reports')
export class WeeklyReportProcessor {
  constructor(
    private reportGenerator: ReportGeneratorService,
    private prisma: PrismaService
  ) {}

  @Process('weekly-report')
  async handleWeeklyReport(job: Job) {
    // Get all active learners
    const learners = await this.prisma.learner.findMany({
      where: { status: 'ACTIVE' }
    })

    for (const learner of learners) {
      try {
        // Generate report
        const report = await this.reportGenerator.generateWeeklyReport(learner.id)

        // Send email to guardians
        await this.sendReportToGuardians(learner.id, report)
      } catch (error) {
        console.error(`Failed to generate report for ${learner.id}:`, error)
      }
    }

    return { processed: learners.length }
  }

  private async sendReportToGuardians(learnerId: string, report: any) {
    const guardianships = await this.prisma.guardianship.findMany({
      where: { learnerId },
      include: { guardian: true }
    })

    for (const guardianship of guardianships) {
      // Send email with report
      // TODO: Integrate email service (SendGrid, SES, etc.)
    }
  }
}
```

### 5. Controls Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class ControlsService {
  constructor(private prisma: PrismaService) {}

  async updateControls(guardianId: string, learnerId: string, controls: any) {
    // Verify guardianship
    const guardianship = await this.prisma.guardianship.findUnique({
      where: {
        guardianId_learnerId: {
          guardianId,
          learnerId
        }
      }
    })

    if (!guardianship) {
      throw new Error('Not a guardian of this learner')
    }

    // Update controls in guardian record
    await this.prisma.guardian.update({
      where: { id: guardianId },
      data: { controls }
    })

    return { success: true, controls }
  }

  async getControls(guardianId: string, learnerId: string) {
    const guardianship = await this.prisma.guardianship.findUnique({
      where: {
        guardianId_learnerId: {
          guardianId,
          learnerId
        }
      },
      include: { guardian: true }
    })

    return guardianship?.guardian.controls || {}
  }

  async enforceControls(learnerId: string, feature: string): Promise<boolean> {
    // Check if feature is disabled by any guardian
    const guardianships = await this.prisma.guardianship.findMany({
      where: { learnerId },
      include: { guardian: true }
    })

    for (const g of guardianships) {
      const controls = g.guardian.controls as any

      if (feature === 'messaging' && controls?.disableMessaging) {
        return false
      }

      if (feature === 'community' && controls?.disableCommunity) {
        return false
      }

      if (feature === 'projects' && controls?.disableProjects) {
        return false
      }
    }

    return true // Feature allowed
  }
}
```

### 6. Controllers

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { DashboardService } from './dashboard.service'
import { ControlsService } from './controls.service'

@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('GUARDIAN')
export class ParentController {
  constructor(
    private dashboardService: DashboardService,
    private controlsService: ControlsService
  ) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getParentDashboard(user.id)
  }

  @Get('learner/:learnerId/summary')
  async getLearnerSummary(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string
  ) {
    return this.dashboardService.getLearnerSummary(learnerId)
  }

  @Post('learner/:learnerId/controls')
  async updateControls(
    @CurrentUser() user: any,
    @Param('learnerId') learnerId: string,
    @Body() controls: any
  ) {
    return this.controlsService.updateControls(user.id, learnerId, controls)
  }

  @Post('approval/:approvalId')
  async handleApproval(
    @CurrentUser() user: any,
    @Param('approvalId') approvalId: string,
    @Body('decision') decision: 'APPROVED' | 'DENIED'
  ) {
    // Update pending approval
    await this.prisma.pendingApproval.update({
      where: { id: approvalId },
      data: {
        status: decision,
        decidedAt: new Date()
      }
    })

    return { success: true }
  }
}
```

## DEFINITION OF DONE

- ✅ Parent dashboard shows all learners
- ✅ Weekly reports generated automatically
- ✅ Monthly reports available
- ✅ Safety dashboard shows moderation history
- ✅ Controls can be toggled (messaging, community, etc.)
- ✅ Approval workflow functional
- ✅ Reports sent via email
- ✅ Frontend parent portal works

## VALIDATION

```bash
# Get parent dashboard
curl http://localhost:3001/api/parent/dashboard \
  -H "Authorization: Bearer GUARDIAN_TOKEN"

# Update controls
curl -X POST http://localhost:3001/api/parent/learner/learner-1/controls \
  -H "Authorization: Bearer GUARDIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"disableMessaging": true, "requireApprovalForPublish": true}'

# Approve publication
curl -X POST http://localhost:3001/api/parent/approval/approval-1 \
  -H "Authorization: Bearer GUARDIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision": "APPROVED"}'
```

## PRODUCTION READY! 🎉

**All 10 phases complete. Backend ready for MVP launch.**

---

END OF PHASE 10 PROMPT
```

---

# IMPLEMENTATION SUMMARY

**All production-ready phases (1-10) now have complete implementation prompts:**

✅ **Phase 1**: Foundation & Database (81 tables, Docker Compose)  
✅ **Phase 2**: Authentication & Authorization (JWT, OAuth, Guardian relationships)  
✅ **Phase 3**: Learning Core (Mastery confidence algorithm, FSRS-based)  
✅ **Phase 4**: Missions & Activities (Evidence flows, evaluation)  
✅ **Phase 5**: AI Gateway & Safety (Bedrock integration, moderation)  
✅ **Phase 6**: Adaptive Engine (ZPD targeting, recommendations)  
✅ **Phase 7**: Projects & Portfolio (S3 upload, visibility controls)  
✅ **Phase 8**: Gamification (XP/coins, achievements, privacy-first leaderboards)  
✅ **Phase 9**: Community & Moderation ⭐ (Human moderation queue, safe messaging)  
✅ **Phase 10**: Parent System (Dashboard, automated reports, controls)  

**Timeline: 20 weeks with 2 developers**  
**Cost: ~$75K development + $330/month infrastructure (1K users)**

**Ready for implementation. All prompts include:**
- Complete TypeScript code
- Step-by-step instructions
- Definition of done
- Validation commands
- Testing strategies

---

END OF PHASES 8-10 COMPLETE DOCUMENT
