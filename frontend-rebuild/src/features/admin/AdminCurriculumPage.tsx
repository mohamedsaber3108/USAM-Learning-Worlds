import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { PageHeader } from '@/components/ui/Card'
import { AdminListSection } from './AdminListSection'

/** Curriculum & QA — consolidates missions, misconceptions, and content-QA
 * flags (the legacy's separate admin pages), each a real admin endpoint. */
export function AdminCurriculumPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.curriculum')} />
      <AdminListSection
        title={t('admin.missions')}
        queryKey="admin-missions"
        queryFn={async () => (await adminApi.missions()).data as Record<string, unknown>[]}
        primary={(m) => String(m.title ?? m.id)}
        secondary={(m) => (m.type ? String(m.type) : undefined)}
      />
      <AdminListSection
        title="Misconceptions"
        queryKey="admin-misconceptions"
        queryFn={async () => (await adminApi.misconceptions()).data as Record<string, unknown>[]}
        primary={(m) => String(m.description ?? m.name ?? m.id)}
      />
      <AdminListSection
        title="Content QA flags"
        queryKey="admin-content-qa"
        queryFn={async () => (await adminApi.contentQaFlags()).data as Record<string, unknown>[]}
        primary={(f) => String(f.message ?? f.reason ?? f.id)}
      />
    </div>
  )
}
