import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { notificationsApi } from '@/lib/api/endpoints'

/**
 * Notification Bell — real frontend surface for the Notification Engine
 * (backend `notifications.controller.ts` was fully built+seeded but had
 * zero frontend references before this pass — same "backend built,
 * frontend dead" bug class documented across Ticks 17-25 in
 * usam_kids_fix_progress.md, instance #9).
 *
 * Polls unread-count every 30s (cheap: single COUNT query), opens a
 * dropdown with the real notification list on click, marks-all-read on
 * open (matches the common inbox-bell UX pattern).
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data.count),
    refetchInterval: 30000,
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
    enabled: open,
  })

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread && unread > 0) {
      markAllRead.mutate()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {!!unread && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lift border border-surface-200 z-50">
            <div className="px-4 py-3 border-b border-surface-100 font-display font-semibold text-slate-700 text-sm">
              Notifications
            </div>
            {(!notifications || notifications.length === 0) && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet</div>
            )}
            {notifications?.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-surface-50 last:border-0">
                <div className="text-sm font-semibold text-slate-700">{n.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{n.body}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
