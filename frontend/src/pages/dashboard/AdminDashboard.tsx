import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'sonner';
import { ShieldAlert, CheckCircle, Ban, Activity, LogOut, X } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'donations'>('pending');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'pending') res = await adminAPI.getPendingNGOs();
      if (activeTab === 'users') res = await adminAPI.getAllUsers();
      if (activeTab === 'donations') res = await adminAPI.getAllDonations();
      setData(res?.data || []);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await adminAPI.verifyNGO(id);
      toast.success('NGO Verified Successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify NGO');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await adminAPI.toggleUserStatus(id);
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleViewCertificate = (certificateUrl?: string) => {
    if (!certificateUrl) {
      toast.error('No registration certificate uploaded for this NGO');
      return;
    }
    setCertificatePreviewUrl(certificateUrl);
  };

  const closeCertificatePreview = () => {
    setCertificatePreviewUrl(null);
  };

  const isPdfCertificate = certificatePreviewUrl?.toLowerCase().includes('.pdf');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar with Sign Out */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-emerald-500" />
              System Administration
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage users, approve NGOs, and monitor platform health.</p>
          </div>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg w-fit border border-slate-800">
          {['pending', 'users', 'donations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                activeTab === tab ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'pending' ? 'Pending NGOs' : tab === 'users' ? 'All Users' : 'Platform Donations'}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading data...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No records found.</div>
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
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{item.organizationName || item.name || item.foodType}</div>
                      <div className="text-xs text-slate-500">{item.role || `${item.quantity} ${item.unit}`}</div>
                    </td>
                    <td className="p-4 text-slate-300">{item.email || item.donor?.email || 'N/A'}</td>
                    <td className="p-4">
                      <span className="text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      {activeTab === 'users' && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${item.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {item.isActive ? 'Active' : 'Suspended'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {activeTab === 'pending' && (
                        <div className="flex items-center justify-end gap-4 ml-auto">
                          <button
                            onClick={() => handleViewCertificate(item.certificateUrl)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View Certificate
                          </button>
                          <button onClick={() => handleVerify(item.id)} className="text-emerald-400 hover:text-emerald-300 flex items-center justify-end gap-1">
                            <CheckCircle size={16} /> Approve
                          </button>
                        </div>
                      )}
                      {activeTab === 'users' && item.role !== 'ADMIN' && (
                        <button onClick={() => handleToggleStatus(item.id)} className={`${item.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'} flex items-center justify-end gap-1 ml-auto`}>
                          {item.isActive ? <><Ban size={16} /> Suspend</> : <><CheckCircle size={16} /> Restore</>}
                        </button>
                      )}
                      {activeTab === 'donations' && (
                        <span className="text-slate-400 flex items-center justify-end gap-1">
                          <Activity size={16} /> {item.status}
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

      {certificatePreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-white font-semibold">Registration Certificate</h3>
              <button
                onClick={closeCertificatePreview}
                className="text-slate-400 hover:text-white"
                aria-label="Close certificate preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-slate-950 h-[70vh]">
              {isPdfCertificate ? (
                <iframe src={certificatePreviewUrl} title="Certificate Preview" className="w-full h-full" />
              ) : (
                <img src={certificatePreviewUrl} alt="NGO registration certificate" className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
