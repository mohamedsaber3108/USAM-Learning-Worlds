import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { PageHeader } from '@/components/ui'
import { AdminListSection } from './AdminListSection'

/** Curriculum & QA — missions, misconceptions, content-QA flags (real admin
 * endpoints), in the shared Table. DS. */
export function AdminCurriculumPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.curriculum')} />
      <AdminListSection
        title={t('admin.missions')}
        queryKey="admin-missions"
        queryFn={async () => (await adminApi.missions()).data as Record<string, unknown>[]}
        columns={['Title', 'Type']}
        row={(m) => [String(m.title ?? m.id), m.type ? String(m.type) : '—']}
      />
      <AdminListSection
        title="Misconceptions"
        queryKey="admin-misconceptions"
        queryFn={async () => (await adminApi.misconceptions()).data as Record<string, unknown>[]}
        columns={['Description']}
        row={(m) => [String(m.description ?? m.name ?? m.id)]}
      />
      <AdminListSection
        title="Content QA flags"
        queryKey="admin-content-qa"
        queryFn={async () => (await adminApi.contentQaFlags()).data as Record<string, unknown>[]}
        columns={['Flag']}
        row={(f) => [String(f.message ?? f.reason ?? f.id)]}
      />
    </div>
  )
}
