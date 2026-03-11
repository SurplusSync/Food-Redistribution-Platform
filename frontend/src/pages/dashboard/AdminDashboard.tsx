import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'sonner';
import {
  ShieldAlert, CheckCircle, Ban, Activity, LogOut, X,
  Bell, Flag, Users, Package, ChevronDown,
  AlertTriangle, Clock, CheckCheck, XCircle, ArrowUpRight,
  RefreshCw, MessageSquare,
} from 'lucide-react';



type AdminTab = 'notifications' | 'pending' | 'users' | 'donations' | 'flagged' | 'tickets';

interface AdminNotification {
  id: string;
  type: 'pending_ngo' | 'support_ticket' | 'flagged_food' | 'new_donation';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  adminNote?: string;
  createdAt: string;
}

interface FlaggedItem {
  id: string;
  donationName: string;
  reportedByEmail: string;
  reason: string;
  status: 'FLAGGED' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  createdAt: string;
}



const priorityStyle: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-slate-700/50 text-slate-400 border-slate-600',
  LOW: 'bg-slate-700/50 text-slate-400 border-slate-600',
};

const statusStyle: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-slate-700/50 text-slate-400 border-slate-600',
  FLAGGED: 'bg-red-500/10 text-red-400 border-red-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-slate-700/50 text-slate-400 border-slate-600',
  ESCALATED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};



function TicketModal({ ticket, onClose, onUpdate }: {
  ticket: SupportTicket; onClose: () => void; onUpdate: () => void;
}) {
  const [adminNote, setAdminNote] = useState(ticket.adminNote || '');
  const [status, setStatus] = useState(ticket.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminAPI.updateTicket(ticket.id, { status, adminNote });
      toast.success('Ticket updated - user notified by email if resolved');
      onUpdate();
      onClose();
    } catch { toast.error('Failed to update ticket'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-white font-semibold">{ticket.subject}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{ticket.userName} · {ticket.userEmail}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-300">{ticket.description}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1.5 block">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as SupportTicket['status'])}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1.5 block">Priority</label>
              <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${priorityStyle[ticket.priority]}`}>
                {ticket.priority}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">
              Admin Note <span className="text-slate-600">(emailed to user on Resolve)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Write a resolution note..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save & Notify User'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('notifications');
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res: unknown;
      if (activeTab === 'notifications') res = await adminAPI.getAdminNotifications();
      else if (activeTab === 'pending') res = await adminAPI.getPendingNGOs();
      else if (activeTab === 'users') res = await adminAPI.getAllUsers();
      else if (activeTab === 'donations') res = await adminAPI.getAllDonations();
      else if (activeTab === 'flagged') res = await adminAPI.getFlaggedDonations();
      else res = await adminAPI.getAllTickets();

      // Axios wraps the body in .data; the server may also wrap in { data: [] }
      const body = (res as { data: unknown })?.data;
      const list = Array.isArray(body) ? body : Array.isArray((body as { data: unknown })?.data) ? (body as { data: unknown[] }).data : [];
      setData(list);
    } catch {
      toast.error('Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs: { key: AdminTab; label: string; icon: ReactNode }[] = [
    { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { key: 'pending', label: 'Pending NGOs', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'users', label: 'All Users', icon: <Users className="w-4 h-4" /> },
    { key: 'donations', label: 'Donations', icon: <Package className="w-4 h-4" /> },
    { key: 'flagged', label: 'Flagged Food', icon: <Flag className="w-4 h-4" /> },
    { key: 'tickets', label: 'Support Tickets', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const notifIcon: Record<string, ReactNode> = {
    pending_ngo: <Users className="w-4 h-4 text-blue-400" />,
    support_ticket: <MessageSquare className="w-4 h-4 text-amber-400" />,
    flagged_food: <Flag className="w-4 h-4 text-red-400" />,
    new_donation: <Package className="w-4 h-4 text-emerald-400" />,
  };

  const notifTarget: Record<string, AdminTab> = {
    pending_ngo: 'pending', support_ticket: 'tickets',
    flagged_food: 'flagged', new_donation: 'donations',
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">System Administration</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage users, donations, and platform health</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              title="Refresh"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex-wrap w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Loading…</div>
          ) : data.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No records found.</div>

          ) : activeTab === 'notifications' ? (
            <div className="divide-y divide-slate-800">
              {(data as AdminNotification[]).map(n => (
                <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-slate-800/20 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.priority === 'high' ? 'bg-red-500/10' : n.priority === 'medium' ? 'bg-amber-500/10' : 'bg-slate-800'
                    }`}>
                    {notifIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-white font-medium text-sm">{n.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyle[n.priority]}`}>
                        {n.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{n.message}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab(notifTarget[n.type])}
                    className="shrink-0 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    View <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

          ) : activeTab === 'flagged' ? (
            <div className="divide-y divide-slate-800">
              {(data as FlaggedItem[]).map(item => (
                <div key={item.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white font-medium text-sm">{item.donationName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm"><span className="text-slate-500">By:</span> {item.reportedByEmail}</p>
                      <p className="text-slate-400 text-sm mt-0.5"><span className="text-slate-500">Reason:</span> {item.reason}</p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {item.status === 'FLAGGED' && (
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={async () => {
                            await adminAPI.updateFlaggedDonation(item.id, { status: 'APPROVED' });
                            toast.success('Approved');
                            fetchData();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={async () => {
                            await adminAPI.updateFlaggedDonation(item.id, { status: 'REJECTED' });
                            toast.success('Rejected');
                            fetchData();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                        <button
                          onClick={async () => {
                            await adminAPI.updateFlaggedDonation(item.id, { status: 'ESCALATED' });
                            toast.success('Escalated');
                            fetchData();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" /> Escalate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          ) : activeTab === 'tickets' ? (
            <div className="divide-y divide-slate-800">
              {(data as SupportTicket[]).map(ticket => (
                <div key={ticket.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white font-medium text-sm">{ticket.subject}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyle[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{ticket.userName} · {ticket.userEmail}</p>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-1">{ticket.description}</p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 border-b border-slate-700 text-white">
                <tr>
                  <th className="p-4 font-semibold">Name / Org</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Date / Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(data as Record<string, unknown>[]).map((item) => (
                  <tr key={item.id as string} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {(item.name || item.organizationName || item.foodType || 'N/A') as string}
                      </div>
                      <div className="text-xs text-slate-500">
                        {activeTab === 'pending'
                          ? (item.organizationName as string || '')
                          : activeTab === 'donations'
                            ? `${item.quantity || ''} ${item.unit || ''}`
                            : (item.role as string || '')}
                      </div>
                    </td>
                    <td className="p-4">{(item.email || (item.donor as Record<string, unknown>)?.email || 'N/A') as string}</td>
                    <td className="p-4">
                      <span className="text-slate-400">
                        {new Date(item.createdAt as string).toLocaleDateString()}
                      </span>
                      {activeTab === 'users' && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs border ${item.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {item.isActive ? 'Active' : 'Suspended'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {activeTab === 'pending' && (
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => setCertUrl((item.certificateUrl as string) || null)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Certificate
                          </button>
                          <button
                            onClick={async () => {
                              await adminAPI.verifyNGO(item.id as string);
                              toast.success('NGO verified - email sent');
                              fetchData();
                            }}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        </div>
                      )}
                      {activeTab === 'users' && item.role !== 'ADMIN' && (
                        <button
                          onClick={async () => {
                            const r = await adminAPI.toggleUserStatus(item.id as string);
                            toast.success(r.data.message);
                            fetchData();
                          }}
                          className={`flex items-center justify-end gap-1 ml-auto text-sm ${item.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'
                            }`}
                        >
                          {item.isActive
                            ? <><Ban className="w-4 h-4" /> Suspend</>
                            : <><CheckCircle className="w-4 h-4" /> Restore</>}
                        </button>
                      )}
                      {activeTab === 'donations' && (
                        <span className="text-slate-500 flex items-center justify-end gap-1 text-sm">
                          <Activity className="w-4 h-4" /> {item.status as string}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Certificate Preview */}
      {certUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <h3 className="text-white font-semibold">Registration Certificate</h3>
              <button onClick={() => setCertUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 h-[70vh]">
              {certUrl.toLowerCase().includes('.pdf')
                ? <iframe src={certUrl} title="Certificate" className="w-full h-full" />
                : <img src={certUrl} alt="Certificate" className="w-full h-full object-contain" />}
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
