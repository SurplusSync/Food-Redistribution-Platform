import { useMemo, useState, type FormEvent } from 'react'
import { MessageSquare, Send, ShieldCheck } from 'lucide-react'

type TicketStatus = 'open' | 'in_progress' | 'resolved'

type Ticket = {
  id: string
  subject: string
  priority: 'low' | 'medium' | 'high'
  status: TicketStatus
  createdAt: string
}

const initialTickets: Ticket[] = [
  { id: 'SUP-401', subject: 'Unable to update profile phone number', priority: 'medium', status: 'in_progress', createdAt: '2026-03-06' },
  { id: 'SUP-397', subject: 'Donation marked delivered but not visible in history', priority: 'high', status: 'open', createdAt: '2026-03-04' },
]

export default function SupportTickets() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as { role?: string }
  const isAdmin = (user.role || '').toUpperCase() === 'ADMIN'

  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const grouped = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open')
    const inProgress = tickets.filter((t) => t.status === 'in_progress')
    const resolved = tickets.filter((t) => t.status === 'resolved')
    return { open, inProgress, resolved }
  }, [tickets])

  const submitTicket = (event: FormEvent) => {
    event.preventDefault()
    if (!subject.trim()) return

    const newTicket: Ticket = {
      id: `SUP-${Math.floor(Math.random() * 900 + 100)}`,
      subject: subject.trim(),
      priority,
      status: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
    }

    setTickets((prev) => [newTicket, ...prev])
    setSubject('')
    setPriority('medium')
  }

  const advanceStatus = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== ticketId) return ticket
        if (ticket.status === 'open') return { ...ticket, status: 'in_progress' }
        if (ticket.status === 'in_progress') return { ...ticket, status: 'resolved' }
        return ticket
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Support Tickets</h1>
        <p className="text-slate-400 mt-1">Raise issues, track resolution, and manage support workflow.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <form onSubmit={submitTicket} className="xl:col-span-1 card p-5 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            Create Ticket
          </h2>
          <input
            className="input-field"
            placeholder="Issue summary"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Ticket subject"
          />
          <select className="select-field" value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Submit Ticket
          </button>
        </form>

        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Ticket Inbox</h2>
            {isAdmin && (
              <span className="badge badge-info flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin Actions Enabled
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300">Open: {grouped.open.length}</div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300">In progress: {grouped.inProgress.length}</div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300">Resolved: {grouped.resolved.length}</div>
          </div>

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{ticket.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">{ticket.id} • {ticket.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${ticket.status === 'resolved' ? 'badge-success' : ticket.status === 'in_progress' ? 'badge-warning' : 'badge-info'}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    {isAdmin && ticket.status !== 'resolved' && (
                      <button type="button" onClick={() => advanceStatus(ticket.id)} className="btn-secondary py-2 px-3 text-xs">
                        Advance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
