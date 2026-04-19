"use client"

import { LoginForm } from "@/components/auth/login-form"
import { School, Loader2 } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

function BackgroundOrbs() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const orbX1 = useSpring(useMotionValue(0), springConfig)
  const orbY1 = useSpring(useMotionValue(0), springConfig)
  const orbX2 = useSpring(useMotionValue(0), springConfig)
  const orbY2 = useSpring(useMotionValue(0), springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const xPct = (clientX / window.innerWidth - 0.5) * 50
      const yPct = (clientY / window.innerHeight - 0.5) * 50
      orbX1.set(xPct)
      orbY1.set(yPct)
      orbX2.set(-xPct)
      orbY2.set(-yPct)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [orbX1, orbY1, orbX2, orbY2])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        style={{ x: orbX1, y: orbY1 }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"
      />
      <motion.div 
        style={{ x: orbX2, y: orbY2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen"
      />
      <div className="absolute top-[20%] right-[10%] w-[25vw] h-[25vw] bg-violet-500/10 rounded-full blur-[90px] mix-blend-screen animate-pulse" />
    </div>
  )
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="dark">
      <div className="relative min-h-screen flex items-center justify-center mesh-gradient overflow-hidden selection:bg-primary/30">
        <BackgroundOrbs />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Noise layer */}
        <div className="noise-texture absolute inset-0 opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg px-6 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center mb-12"
          >
            {/* Elite Logo Container */}
            <div className="relative group mb-6">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-20 h-20 bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center rounded-2xl shadow-2xl">
                <School className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-5xl font-display font-black tracking-tighter text-white mb-3 text-shadow-glow"
              >
                Omni<span className="text-primary">Campus</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-white/60 font-medium tracking-wide uppercase text-xs"
              >
                The Architecture of Modern Learning
              </motion.p>
            </div>
          </motion.div>

          {/* Premium Login Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="glass-premium noise-overlay rounded-[2.5rem] p-1 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)]"
          >
            <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12">
              <Suspense fallback={
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-white/20 text-sm font-medium animate-pulse">Initializing Secure Gateway...</p>
                </div>
              }>
                <LoginForm />
              </Suspense>
              
              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">
                  Elite Enterprise Infrastructure • v3.0 Platinum
                </p>
              </div>
            </div>
          </motion.div>

          {/* Minimal Footer Nav */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 flex justify-center space-x-8 text-white/30 text-[10px] font-bold uppercase tracking-widest"
          >
            <a href="#" className="hover:text-primary transition-colors duration-300">Architecture</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Security</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Support</a>
          </motion.div>
        </div>
        
        <style jsx global>{`
          .text-shadow-glow {
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
          }
        `}</style>
      </div>
    </div>

  )
}
