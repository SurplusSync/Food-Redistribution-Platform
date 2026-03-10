import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'sonner';
import { ShieldAlert, CheckCircle, Ban, Activity, LogOut, X } from 'lucide-react';

const flaggedFoodSeed = [
  {
    id: 'FG-201',
    organizationName: 'Community Donor',
    email: 'donor@example.com',
    createdAt: new Date().toISOString(),
    status: 'FLAGGED',
    reason: 'Possible quality issue (temperature mismatch)',
  },
  {
    id: 'FG-202',
    organizationName: 'Neighborhood Bakery',
    email: 'bakery@example.com',
    createdAt: new Date().toISOString(),
    status: 'FLAGGED',
    reason: 'Reported stale packaging by volunteer',
  },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'donations' | 'flagged'>('pending');
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
      if (activeTab === 'flagged') {
        setData(flaggedFoodSeed);
      } else {
        setData(res?.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch admin data');
      if (activeTab !== 'flagged') {
        setData([]);
      }
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
      toast.error(t('noCertificateUploaded'));
      return;
    }
    setCertificatePreviewUrl(certificateUrl);
  };

  const closeCertificatePreview = () => {
    setCertificatePreviewUrl(null);
  };

  const handleFlaggedDecision = (id: string, decision: 'approved' | 'rejected' | 'escalated') => {
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: decision.toUpperCase() } : item)));
    toast.success(`Flagged donation ${decision}`);
  };

  const isPdfCertificate = certificatePreviewUrl?.toLowerCase().includes('.pdf');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success(t('signedOutSuccessfully'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar with Sign Out */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-300 dark:border-slate-700"
          >
            <LogOut size={18} />
            {t('signOut')}
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="text-emerald-500" />
              {t('systemAdministration')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('manageUsersDesc')}</p>
          </div>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex space-x-1 bg-white/80 dark:bg-slate-900/50 p-1 rounded-lg w-fit border border-gray-200 dark:border-slate-800">
          {['pending', 'users', 'donations', 'flagged'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                activeTab === tab ? 'bg-emerald-500 text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab === 'pending' ? t('pendingNGOs') : tab === 'users' ? t('allUsers') : tab === 'donations' ? t('platformDonations') : 'Flagged Food Review'}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">{t('loadingData')}</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">{t('noRecordsFound')}</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-700 dark:text-slate-300">
              <thead className="bg-gray-100/80 dark:bg-slate-800/50 border-b border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white">
                <tr>
                  <th className="p-4 font-semibold">{t('nameOrg')}</th>
                  <th className="p-4 font-semibold">{t('email')}</th>
                  <th className="p-4 font-semibold">{t('dateStatus')}</th>
                  <th className="p-4 font-semibold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100/80 dark:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name || item.organizationName || item.foodType || 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-500">
                        {activeTab === 'pending' ? (item.organizationName || '') :
                         activeTab === 'donations' ? (item.quantity && item.unit ? `${item.quantity} ${item.unit}` : item.status || '') :
                         (item.role || '')}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-slate-300">{item.email || item.donor?.email || 'N/A'}</td>
                    <td className="p-4">
                      <span className="text-gray-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                      {activeTab === 'users' && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${item.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {item.isActive ? t('active') : t('suspended')}
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
                            {t('viewCertificate')}
                          </button>
                          <button onClick={() => handleVerify(item.id)} className="text-emerald-400 hover:text-emerald-300 flex items-center justify-end gap-1">
                            <CheckCircle size={16} /> {t('approve')}
                          </button>
                        </div>
                      )}
                      {activeTab === 'users' && item.role !== 'ADMIN' && (
                        <button onClick={() => handleToggleStatus(item.id)} className={`${item.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'} flex items-center justify-end gap-1 ml-auto`}>
                          {item.isActive ? <><Ban size={16} /> {t('suspend')}</> : <><CheckCircle size={16} /> {t('restore')}</>}
                        </button>
                      )}
                      {activeTab === 'donations' && (
                        <span className="text-gray-500 dark:text-slate-400 flex items-center justify-end gap-1">
                          <Activity size={16} /> {item.status}
                        </span>
                      )}
                      {activeTab === 'flagged' && (
                        <div className="flex items-center justify-end gap-3 ml-auto">
                          <button onClick={() => handleFlaggedDecision(item.id, 'approved')} className="text-emerald-400 hover:text-emerald-300">
                            Approve
                          </button>
                          <button onClick={() => handleFlaggedDecision(item.id, 'rejected')} className="text-red-400 hover:text-red-300">
                            Reject
                          </button>
                          <button onClick={() => handleFlaggedDecision(item.id, 'escalated')} className="text-amber-400 hover:text-amber-300">
                            Escalate
                          </button>
                        </div>
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
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-gray-900 dark:text-white font-semibold">{t('registrationCertificateLabel')}</h3>
              <button
                onClick={closeCertificatePreview}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close certificate preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-slate-950 h-[70vh]">
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
