"use client"

import React from "react"
import dynamic from "next/dynamic"
import { AnimatedCard } from "@/components/ui/animated-primitives"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { MoreHorizontal, SquareStack } from "lucide-react"

// Dynamic import for ApexCharts to prevent SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface ChartWidgetProps {
  title: string
  description?: string
  series: any[]
  categories?: string[]
  type?: "area" | "bar" | "line" | "donut" | "radialBar" | "pie"
  height?: number | string
  colors?: string[]
  className?: string
  index?: number
}

export function ChartWidget({
  title,
  description,
  series,
  categories,
  type = "area",
  height = 300,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
  className,
  index = 0
}: ChartWidgetProps) {
  
  const options: any = {
    chart: {
      toolbar: { show: false },
      fontFamily: "var(--font-dm-sans)",
      background: "transparent",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: type === "line",
        top: 10,
        left: 0,
        blur: 5,
        opacity: 0.1
      }
    },
    colors: colors,
    stroke: {
      curve: "smooth",
      width: type === "area" || type === "line" ? 3 : 0,
      lineCap: "round",
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(148, 163, 184, 0.08)",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
          fontWeight: 600
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
          fontWeight: 600
        }
      }
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "10px",
      fontWeight: 800,
      fontFamily: "var(--font-heading)",
      markers: { radius: 4, width: 8, height: 8 },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    tooltip: {
      theme: "dark",
      x: { show: true },
      y: {
        formatter: (val: number) => val.toLocaleString()
      },
      style: {
        fontSize: '11px',
        fontFamily: "var(--font-dm-sans)"
      }
    },
    fill: {
      type: type === "area" ? "gradient" : "solid",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 90, 100]
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
        strokeWidth: 2
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "35%",
        distributed: type === "bar" && series.length === 1,
      },
      pie: {
        donut: {
          size: "82%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "AGGREGATE",
              fontSize: "10px",
              fontWeight: 900,
              color: "#94a3b8",
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0)
                return total > 1000 ? (total/1000).toFixed(1) + 'K' : total.toLocaleString()
              }
            },
            value: {
              fontSize: "24px",
              fontWeight: 900,
              color: "inherit",
              fontFamily: "var(--font-heading)"
            }
          }
        }
      }
    }
  }

  return (
    <AnimatedCard index={index} className={cn("relative overflow-hidden group perspective-1000", className)}>
      <div className="relative h-full rounded-[2.5rem] border border-white/10 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-xl transition-all duration-700 group-hover:bg-white/50 dark:group-hover:bg-zinc-900/50 p-6 flex flex-col">
        
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-heading">Analytic Node</h4>
             </div>
             <CardTitle className="text-xl font-black font-heading tracking-tighter dark:text-white leading-none">
                {title}
             </CardTitle>
             {description && (
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
                 {description}
               </p>
             )}
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="p-2 hover:bg-muted/50 rounded-full transition-colors text-muted-foreground/30"
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex-1 w-full min-h-[220px]">
          <Chart
            options={options}
            series={series}
            type={type}
            height={height}
            width="100%"
          />
        </div>

        {/* Tactical Overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Subtle Scanline Animation */}
      <motion.div 
        animate={{ translateY: ["0%", "400%", "0%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(transparent,rgba(255,255,255,0.5),transparent)] h-[1px]"
      />
    </AnimatedCard>
  )
}
