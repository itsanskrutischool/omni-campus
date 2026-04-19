"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { VibrantCard } from "@/components/ui/vibrant-card"
import { ArrowUpRight } from "lucide-react"

interface FeeTrendData {
  categories: string[]
  series: { name: string; data: number[] }[]
}

interface FinanceData {
  totalRevenue: string
  revenueGrowth: string
}

export function FinancialFlow({ feeTrend, finance }: { feeTrend: FeeTrendData; finance: FinanceData }) {
  const data = useMemo(() => {
    return feeTrend.categories.map((cat, i) => ({
      name: cat,
      fees: feeTrend.series[0]?.data[i] ?? 0,
      target: feeTrend.series[1]?.data[i] ?? 0,
    }))
  }, [feeTrend])

  return (
    <VibrantCard glowColor="emerald" className="p-10 h-full">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">Financial Intelligence</h2>
          <p className="text-zinc-500 text-sm font-medium">Revenue collection vs Projection matrix.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black uppercase text-zinc-400">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-black uppercase text-zinc-400">Target</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: '20px',
                backgroundColor: '#000',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '900'
              }}
            />
            <Area
              type="monotone"
              dataKey="fees"
              stroke="#3b82f6"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorFees)"
              animationDuration={2000}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth={2}
              strokeDasharray="10 10"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-100 dark:border-white/5 pt-8">
        <div>
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Peak Performance</span>
          <div className="text-xl font-black text-emerald-500 flex items-center gap-2">
            {finance.totalRevenue}
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Forecast Margin</span>
          <div className="text-xl font-black text-blue-500">{finance.revenueGrowth}</div>
        </div>
      </div>
    </VibrantCard>
  )
}
