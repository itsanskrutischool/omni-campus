"use client"

import { useState, useEffect } from "react"

export function LiveClock() {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col items-end opacity-0">
        <div className="text-2xl font-black tracking-tighter tabular-nums dark:text-white">
          00:00:00 AM
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <div className="text-2xl font-black tracking-tighter tabular-nums dark:text-white">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
        {time.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>
    </div>
  )
}
