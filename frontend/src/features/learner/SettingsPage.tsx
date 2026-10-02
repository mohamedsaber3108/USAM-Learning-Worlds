import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { setLanguage, type Language } from '@/lib/i18n'
import { authApi, dailyGoalsApi, type DailyGoalProgress } from '@/lib/api/endpoints'
import { Card, PageHeader, SectionHeader, Button, Avatar, Input, useToast } from '@/components/ui'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

const AGE_BANDS: AgeBand[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']

/** Learner settings — only controls the backend can persist: language (local),
 * age band (PATCH /auth/me/age-band). Profile from real /auth/me. DS. */
export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const user = useAuthStore((s) => s.user)
  const loadSession = useAuthStore((s) => s.loadSession)
  const [savingAge, setSavingAge] = useState(false)
  const name = user?.learner?.displayName || user?.learner?.firstName || user?.email || ''

  async function changeAge(band: AgeBand) {
    setSavingAge(true)
    try {
      await authApi.updateAgeBand(band)
      await loadSession()
      toast.show(t('common.save'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSavingAge(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.settings')} />

      <section>
        <SectionHeader title={t('learner.profile')} />
        <Card className="flex items-center gap-4">
          <Avatar name={name} size={48} />
          <div>
            <p className="font-medium text-ink-900">{name}</p>
            <p className="mt-0.5 text-sm text-ink-500">{user?.email}</p>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title={t('learner.language')} />
        <div className="flex gap-2">
          {(['en', 'ar'] as Language[]).map((lng) => (
            <Button
              key={lng}
              variant={i18n.language === lng ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLanguage(lng)}
            >
              {lng === 'en' ? 'English' : 'العربية'}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Age band" />
        <div className="flex flex-wrap gap-2">
          {AGE_BANDS.map((band) => (
            <Button
              key={band}
              variant={user?.learner?.ageBand === band ? 'primary' : 'secondary'}
              size="sm"
              loading={savingAge && user?.learner?.ageBand !== band}
              onClick={() => changeAge(band)}
            >
              {AGE_BAND_LABEL[band]}
            </Button>
          ))}
        </div>
      </section>

      <DailyGoalSection />
    </div>
  )
}

/**
 * Daily goal editor — real PUT /daily-goals/me (dailyGoalsApi.setGoal). Had
 * a wrapper with zero UI caller before this pass: HomePage only ever read
 * progress against whatever goal already existed, with no way for a
 * learner to actually set or change their own target minutes/activities.
 * Named explicitly as a required Home/Rewards concept ("Daily Goal").
 */
function DailyGoalSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const qc = useQueryClient()
  const [minutes, setMinutes] = useState('')
  const [activities, setActivities] = useState('')
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({
    queryKey: ['daily-goal-progress', 'settings'],
    queryFn: async () => (await dailyGoalsApi.getProgress()).data as DailyGoalProgress,
    retry: false,
  })

  const currentMinutes = data?.goal.targetMinutes
  const currentActivities = data?.goal.targetActivities

  async function save() {
    const targetMinutes = minutes ? Number(minutes) : currentMinutes
    const targetActivities = activities ? Number(activities) : currentActivities
    if (!targetMinutes || !targetActivities) return
    setSaving(true)
    try {
      await dailyGoalsApi.setGoal({ targetMinutes, targetActivities })
      await qc.invalidateQueries({ queryKey: ['daily-goal-progress'] })
      toast.show(t('common.save'), 'success')
      setMinutes('')
      setActivities('')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <SectionHeader title={t('learner.dailyGoalTitle')} subtitle={t('learner.dailyGoalSettingsHint')} />
      <Card className="flex flex-wrap items-end gap-3">
        <Input
          label={t('learner.dailyGoalMinutesLabel')}
          type="number"
          min={5}
          step={5}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder={currentMinutes ? String(currentMinutes) : '15'}
        />
        <Input
          label={t('learner.dailyGoalActivitiesLabel')}
          type="number"
          min={1}
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
          placeholder={currentActivities ? String(currentActivities) : '3'}
        />
        <Button size="sm" loading={saving} onClick={() => void save()}>
          {t('common.save')}
        </Button>
      </Card>
    </section>
  )
}
