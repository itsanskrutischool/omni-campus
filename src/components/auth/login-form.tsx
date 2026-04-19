"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowRight, ShieldCheck, School, Mail, Lock, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/lib/auth-actions"

const loginSchema = z.object({
  tenantSlug: z.string().min(1, "School Code is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_LOGIN: LoginFormValues = {
  tenantSlug: "st-xaviers",
  email: "superadmin@omnicampus.edu.in",
  password: "OmniCampus@123",
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"SLUG" | "AUTH">("SLUG")

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantSlug: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAction({
        ...values,
        redirectTo: searchParams.get("callbackUrl") || undefined,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    const slug = form.getValues("tenantSlug")
    if (!slug) {
      form.setError("tenantSlug", { message: "Please enter a school code" })
      return
    }
    setStep("AUTH")
  }

  const applyDemoCredentials = () => {
    setError(null)
    form.reset(DEMO_LOGIN)
    setStep("AUTH")
  }

  const handleQuickLogin = async () => {
    applyDemoCredentials()
    await onSubmit(DEMO_LOGIN)
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            {step === "SLUG" ? (
              <motion.div 
                key="slug-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="tenantSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-2 block">
                        Enterprise Domain
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <School className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            placeholder="your-campus-id"
                            className="pl-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/10 h-14 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 backdrop-blur-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-2" />
                    </FormItem>
                  )}
                />
                
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="button"
                    className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-2xl font-bold tracking-tight text-lg shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)] group transition-all duration-500 overflow-hidden relative"
                    onClick={handleNext}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Begin Auth <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Button>
                </motion.div>
                
                <p className="text-center text-white/20 text-xs font-medium">
                  Enter your unique campus identifier provided by IT
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="auth-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <button 
                    type="button"
                    className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold transition-colors"
                    onClick={() => setStep("SLUG")}
                  >
                    <ArrowRight className="h-3 w-3 rotate-180" /> Change Domain
                  </button>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black text-white/60 tracking-tighter uppercase">{form.getValues("tenantSlug")}</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-2 block">Personnel ID</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            placeholder="id@campus.edu"
                            className="pl-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/10 h-14 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-2 block">Security Token</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors duration-300" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-12 bg-white/[0.03] border-white/10 text-white placeholder:text-white/10 h-14 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all duration-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl font-bold tracking-tight text-lg shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)] group transition-all duration-500 overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-3 h-5 w-5" />
                          Verifying Protocol...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-3 h-5 w-5" />
                          Decrypt & Connect
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center tracking-wide uppercase shadow-[0_10px_30px_-5px_rgba(239,68,68,0.2)]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4 flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="text-xs border-primary/20 hover:bg-primary/10 text-primary/80 hover:text-primary transition-all duration-300"
          onClick={() => void handleQuickLogin()}
        >
          {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
          {isLoading ? "Connecting Demo..." : "Quick Login: Super Admin"}
        </Button>
      </div>
    </div>
  )
}
