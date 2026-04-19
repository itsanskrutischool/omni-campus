import { CheckCircle2, AlertCircle, Info, TrendingUp } from "lucide-react"

const activities = [
  { id: 1, type: "SUCCESS", msg: "Attendance finalized for Class 10-A", time: "5m ago", icon: CheckCircle2, color: "text-emerald-500" },
  { id: 2, type: "INFO", msg: "New circular posted for Parent-Teacher Meeting", time: "12m ago", icon: Info, color: "text-blue-500" },
  { id: 3, type: "FINANCE", msg: "Fee collected for Student #2401", time: "25m ago", icon: TrendingUp, color: "text-violet-500" },
  { id: 4, type: "WARNING", msg: "Library return overdue: Class 8-B", time: "1h ago", icon: AlertCircle, color: "text-amber-500" },
]

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-white/5 ${act.color}`}>
            <act.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-500 transition-colors">
              {act.msg}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{act.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
