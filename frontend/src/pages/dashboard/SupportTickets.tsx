import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageSquare, Send, ShieldCheck, Loader2, RefreshCw } from 'lucide-react'
import { adminAPI, supportAPI } from '../../services/api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

type Ticket = {
  id: string
  subject: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  adminNote?: string
  createdAt: string
}

export default function SupportTickets() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as { role?: string }
  const isAdmin = (user.role || '').toUpperCase() === 'ADMIN'
  const { t } = useTranslation()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = isAdmin
        ? await adminAPI.getAllTickets()
        : await supportAPI.getMyTickets()
      const body = res.data
      setTickets(Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [])
    } catch {
      toast.error(t('failedLoadTickets'))
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => { load() }, [load])

  const grouped = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN')
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS')
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED')
    return { open, inProgress, resolved }
  }, [tickets])

  const submitTicket = async (event: FormEvent) => {
    event.preventDefault()
    if (!subject.trim() || !description.trim()) return
    setSubmitting(true)
    try {
      await supportAPI.createTicket({ subject: subject.trim(), description: description.trim(), priority })
      toast.success(t('ticketSubmitted'))
      setSubject('')
      setDescription('')
      setPriority('MEDIUM')
      load()
    } catch {
      toast.error(t('failedSubmitTicket'))
    } finally {
      setSubmitting(false)
    }
  }

  const advanceStatus = async (ticket: Ticket) => {
    const next = ticket.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED'
    try {
      await adminAPI.updateTicket(ticket.id, { status: next })
      toast.success(`Ticket moved to ${next.replace('_', ' ').toLowerCase()}`)
      load()
    } catch {
      toast.error(t('failedUpdateTicket'))
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'RESOLVED' || status === 'CLOSED') return 'badge-success'
    if (status === 'IN_PROGRESS') return 'badge-warning'
    return 'badge-info'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{t('supportTicketsTitle')}</h1>
          <p className="text-slate-400 mt-1">{t('supportDesc')}</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <form onSubmit={submitTicket} className="xl:col-span-1 card p-5 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            {t('createTicket')}
          </h2>
          <input
            className="input-field"
            placeholder={t('issueSummaryPlaceholder')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Ticket subject"
          />
          <textarea
            className="input-field resize-none"
            placeholder={t('describeIssuePlaceholder')}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Ticket description"
          />
          <select className="select-field" value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
            <option value="LOW">{t('lowPriority')}</option>
            <option value="MEDIUM">{t('mediumPriority')}</option>
            <option value="HIGH">{t('highPriority')}</option>
          </select>
          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? t('submitting') : t('submitTicket')}
          </button>
        </form>

        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">{t('ticketInbox')}</h2>
            {isAdmin && (
              <span className="badge badge-info flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {t('adminActionsEnabled')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300">{t('openStatus')}: {grouped.open.length}</div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300">{t('inProgress')}: {grouped.inProgress.length}</div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300">{t('resolvedStatus')}: {grouped.resolved.length}</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="ml-3 text-slate-400 text-sm">{t('loadingTickets')}</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">{t('noTicketsYet')}</div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-medium">{ticket.subject}</p>
                      <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{ticket.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()} · {ticket.priority}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${statusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      {isAdmin && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                        <button type="button" onClick={() => advanceStatus(ticket)} className="btn-secondary py-2 px-3 text-xs">
                          {t('advance')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
