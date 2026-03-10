import { useEffect, useState, useCallback } from 'react'
import { Medal, Trophy, Users, Loader2, RefreshCw } from 'lucide-react'
import { getLeaderboard, type LeaderboardEntry } from '../../services/api'
import { useTranslation } from 'react-i18next'

type Scope = 'weekly' | 'monthly' | 'all'

export default function Leaderboards() {
  const [scope, setScope] = useState<Scope>('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  const currentUserName = (JSON.parse(localStorage.getItem('user') || '{}').name as string) || 'You'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const roleParam = roleFilter !== 'all' ? roleFilter.toUpperCase() : undefined
      const data = await getLeaderboard(scope, roleParam)
      setLeaders(data)
    } catch {
      setLeaders([])
    } finally {
      setLoading(false)
    }
  }, [scope, roleFilter])

  useEffect(() => { load() }, [load])

  const filteredRows = leaders

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('leaderboardsTitle')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">{t('leaderboardsDesc')}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['weekly', 'monthly', 'all'] as Scope[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setScope(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize ${scope === tab
              ? 'bg-emerald-500 text-white'
              : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
          >
            {tab === 'all' ? t('allTime') : tab === 'weekly' ? t('weekly') : t('monthly')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">{t('allRoles')}</option>
          <option value="donor">{t('donor')}</option>
          <option value="ngo">{t('ngo')}</option>
          <option value="volunteer">{t('volunteer')}</option>
        </select>
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-3 flex items-center gap-2 text-gray-600 dark:text-slate-300">
          <Users className="w-4 h-4 text-emerald-400" />
          {t('currentProfileLabel')}: {currentUserName}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Trophy className="w-5 h-5 text-amber-400" />
          {t('topContributors')}
          {scope !== 'all' && <span className="text-sm font-normal text-gray-500 dark:text-slate-400 capitalize">- {scope === 'weekly' ? t('weekly') : t('monthly')}</span>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="ml-3 text-gray-500 dark:text-slate-400 text-sm">{t('loadingRankings')}</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {filteredRows.map((entry, idx) => {
              const rank = idx + 1
              const isCurrentUser = entry.name === currentUserName
              return (
                <div
                  key={entry.id}
                  className={`p-4 flex items-center justify-between ${isCurrentUser ? 'bg-emerald-50 dark:bg-emerald-500/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${rank === 1 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : rank === 2 ? 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                          : rank === 3 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                      }`}>
                      {rank}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                        {rank <= 3 && <Medal className={`w-4 h-4 ${rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-gray-400' : 'text-orange-400'
                          }`} />}
                        {entry.name}
                        {isCurrentUser && <span className="text-xs text-emerald-500 font-normal">({t('you')})</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{entry.role}</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 font-semibold">{entry.score} {t('pts')}</div>
                </div>
              )
            })}
            {filteredRows.length === 0 && (
              <div className="p-6 text-center text-gray-500 dark:text-slate-500">
                {t('noLeaderboardEntries')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
