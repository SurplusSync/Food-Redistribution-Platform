import { useMemo, useState } from 'react'
import { Medal, Trophy, Users } from 'lucide-react'

type Scope = 'weekly' | 'monthly' | 'all'

type Leader = {
  id: string
  name: string
  role: 'Donor' | 'NGO' | 'Volunteer'
  city: string
  score: number
}

const boardData: Record<Scope, Leader[]> = {
  weekly: [
    { id: 'u1', name: 'Anita Verma', role: 'Donor', city: 'Delhi', score: 430 },
    { id: 'u2', name: 'Food First NGO', role: 'NGO', city: 'Noida', score: 390 },
    { id: 'u3', name: 'Karan S.', role: 'Volunteer', city: 'Gurgaon', score: 360 },
  ],
  monthly: [
    { id: 'u2', name: 'Food First NGO', role: 'NGO', city: 'Noida', score: 1320 },
    { id: 'u4', name: 'Sonia Mehta', role: 'Donor', city: 'Delhi', score: 1280 },
    { id: 'u3', name: 'Karan S.', role: 'Volunteer', city: 'Gurgaon', score: 1190 },
  ],
  all: [
    { id: 'u5', name: 'Sewa Hands', role: 'NGO', city: 'Delhi', score: 8890 },
    { id: 'u6', name: 'Rohan B.', role: 'Volunteer', city: 'Faridabad', score: 8450 },
    { id: 'u4', name: 'Sonia Mehta', role: 'Donor', city: 'Delhi', score: 8230 },
  ],
}

export default function Leaderboards() {
  const [scope, setScope] = useState<Scope>('weekly')
  const [cityFilter, setCityFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const currentUserName = (JSON.parse(localStorage.getItem('user') || '{}').name as string) || 'You'

  const filteredRows = useMemo(() => {
    return boardData[scope].filter((row) => {
      const cityPass = cityFilter === 'all' || row.city.toLowerCase() === cityFilter
      const rolePass = roleFilter === 'all' || row.role.toLowerCase() === roleFilter
      return cityPass && rolePass
    })
  }, [scope, cityFilter, roleFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Leaderboards</h1>
        <p className="text-slate-400 mt-1">Celebrate top contributors and community champions across timelines.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['weekly', 'monthly', 'all'] as Scope[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setScope(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize ${scope === tab ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            {tab === 'all' ? 'All Time' : tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select className="select-field" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
          <option value="all">All cities</option>
          <option value="delhi">Delhi</option>
          <option value="noida">Noida</option>
          <option value="gurgaon">Gurgaon</option>
          <option value="faridabad">Faridabad</option>
        </select>
        <select className="select-field" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="donor">Donor</option>
          <option value="ngo">NGO</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <div className="card px-4 py-3 flex items-center gap-2 text-slate-300">
          <Users className="w-4 h-4 text-emerald-400" />
          Current profile: {currentUserName}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-white font-semibold">
          <Trophy className="w-5 h-5 text-amber-400" />
          Top Contributors
        </div>
        <div className="divide-y divide-slate-800">
          {filteredRows.map((entry, idx) => {
            const rank = idx + 1
            return (
              <div key={entry.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm text-slate-200">{rank}</div>
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      {rank <= 3 && <Medal className="w-4 h-4 text-amber-400" />}
                      {entry.name}
                    </p>
                    <p className="text-xs text-slate-500">{entry.role} • {entry.city}</p>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold">{entry.score} pts</div>
              </div>
            )
          })}
          {filteredRows.length === 0 && <div className="p-6 text-center text-slate-500">No leaderboard entries for selected filters.</div>}
        </div>
      </div>
    </div>
  )
}
