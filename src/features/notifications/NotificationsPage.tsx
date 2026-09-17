import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BellOff,
  CheckCheck,
  ShieldAlert,
  FileText,
  CreditCard,
  Layers,
  Info,
  ArrowRight,
  AlertCircle,
  Settings,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { notificationService } from '@/services/notification.service'
import { useToast } from '@/hooks'
import { civicStorage } from '@/services/storage'
import type { CivicNotification, NotificationCategory } from '@/types'

// ─── Urgency mapping ────────────────────────────────────────────────────────
function getUrgency(n: CivicNotification): 'critical' | 'important' | 'info' {
  if (n.category === 'security') return 'critical'
  if (n.category === 'application' || n.category === 'document') return 'important'
  return 'info'
}

const URGENCY_STYLES = {
  critical: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  important: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
}
const URGENCY_LABELS = { critical: 'Critical', important: 'Important', info: 'Info' }

// ─── Category icons ─────────────────────────────────────────────────────────
function getCategoryIcon(cat: NotificationCategory) {
  switch (cat) {
    case 'security':    return <ShieldAlert className="w-5 h-5 text-rose-500" />
    case 'document':   return <FileText className="w-5 h-5 text-purple-500" />
    case 'payment':    return <CreditCard className="w-5 h-5 text-amber-500" />
    case 'application':return <Layers className="w-5 h-5 text-sky-500" />
    default:           return <Info className="w-5 h-5 text-blue-500" />
  }
}

// ─── Inline action label per category ───────────────────────────────────────
function getInlineAction(n: CivicNotification): string | null {
  if (n.actionUrl && n.actionLabel) return n.actionLabel
  if (n.category === 'security') return 'View Security Center'
  if (n.category === 'document') return 'View Documents'
  if (n.category === 'application') return 'View Application'
  if (n.category === 'payment') return 'View Payments'
  return null
}

function getInlineRoute(n: CivicNotification): string | null {
  if (n.actionUrl) return n.actionUrl
  if (n.category === 'security') return '/app/security'
  if (n.category === 'document') return '/app/documents'
  if (n.category === 'application') return '/app/applications'
  if (n.category === 'payment') return '/app/payments'
  return null
}

type MutedCategory = NotificationCategory | 'all'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<CivicNotification[]>(() =>
    civicStorage.getNotifications()
  )
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all')
  const [mutedCategories, setMutedCategories] = useState<Set<NotificationCategory>>(new Set())
  const [showPrefs, setShowPrefs] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const categories: { id: NotificationCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Alerts' },
    { id: 'application', label: 'Applications' },
    { id: 'document', label: 'Documents' },
    { id: 'payment', label: 'Payments' },
    { id: 'security', label: 'Security' },
    { id: 'civic', label: 'Civic Advisory' },
  ]

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Unread count per category
  const unreadPerCat = useMemo(() => {
    const map: Partial<Record<NotificationCategory | 'all', number>> = {}
    notifications.filter((n) => !n.isRead).forEach((n) => {
      map[n.category] = (map[n.category] ?? 0) + 1
    })
    return map
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    let list = selectedCategory === 'all' ? notifications : notifications.filter((n) => n.category === selectedCategory)
    // Sort: unread first, then by urgency, then by date
    return list.sort((a, b) => {
      if (!a.isRead && b.isRead) return -1
      if (a.isRead && !b.isRead) return 1
      const urgencyOrder = { critical: 0, important: 1, info: 2 }
      const diff = urgencyOrder[getUrgency(a)] - urgencyOrder[getUrgency(b)]
      if (diff !== 0) return diff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [notifications, selectedCategory])

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast.success('All Marked as Read')
  }

  const handleMarkSingleRead = async (id: string, route?: string | null) => {
    await notificationService.markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    if (route) navigate(route)
  }

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const toggleMute = (cat: NotificationCategory) => {
    setMutedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
    toast.success(mutedCategories.has(cat) ? `${cat} Unmuted` : `${cat} Muted`, 'Preference saved.')
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Notification & Advisory Center
            </h1>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time statutory updates, document expiry alerts, and security verification logs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrefs((v) => !v)}
            className="gap-1.5 text-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            Preferences
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification Preferences Panel */}
      {showPrefs && (
        <div className="p-4 rounded-2xl border border-border bg-card shadow-subtle animate-in fade-in duration-150">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Notification Preferences — Mute by Category
          </p>
          <div className="flex flex-wrap gap-2">
            {(['security', 'application', 'document', 'payment', 'civic'] as NotificationCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => toggleMute(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  mutedCategories.has(cat)
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                    : 'bg-muted text-foreground border-border hover:border-primary/40'
                }`}
              >
                {mutedCategories.has(cat)
                  ? <BellOff className="w-3 h-3" />
                  : <Bell className="w-3 h-3" />
                }
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Bar with unread counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60 no-scrollbar">
        {categories.map((cat) => {
          const unread = cat.id === 'all' ? unreadCount : (unreadPerCat[cat.id as NotificationCategory] ?? 0)
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-subtle'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label}
              {unread > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'
                }`}>
                  {unread}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No Notifications in this Category"
          description="You are fully up-to-date with all departmental notifications and statutory advisories."
        />
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notif) => {
            const urgency = getUrgency(notif)
            const inlineAction = getInlineAction(notif)
            const inlineRoute = getInlineRoute(notif)
            const isMuted = mutedCategories.has(notif.category)

            return (
              <div
                key={notif.id}
                className={`relative rounded-2xl border bg-card transition-all hover:shadow-subtle ${
                  !notif.isRead ? 'border-primary/20 bg-primary/5' : 'border-border'
                } ${isMuted ? 'opacity-50' : ''}`}
              >
                {/* Urgency accent bar */}
                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                  urgency === 'critical' ? 'bg-rose-500' : urgency === 'important' ? 'bg-amber-500' : 'bg-blue-500/40'
                }`} />

                <div className="pl-5 pr-4 py-4 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-card border border-border shrink-0 shadow-subtle mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{notif.title}</h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
                        )}
                        <Badge variant="outline" className={`text-[9px] font-bold ${URGENCY_STYLES[urgency]}`}>
                          {urgency === 'critical' && <AlertCircle className="w-2.5 h-2.5 mr-0.5" />}
                          {URGENCY_LABELS[urgency]}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {new Date(notif.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>

                    {/* Inline Actions */}
                    {inlineAction && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          onClick={() => handleMarkSingleRead(notif.id, inlineRoute)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          {inlineAction}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => handleDismiss(notif.id)}
                    className="shrink-0 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
