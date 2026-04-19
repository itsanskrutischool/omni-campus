'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  GraduationCap, 
  IndianRupee, 
  Settings, 
  MessageSquare,
  History,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/providers/tenant-provider';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { tenantId } = useTenant();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30 
              }}
              className="w-full max-w-[640px] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white overflow-hidden pointer-events-auto ring-1 ring-black/5"
            >
              <Command className="flex flex-col h-full w-full outline-none">
                <div className="flex items-center px-6 border-b border-gray-100/50">
                  <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <Command.Input 
                    placeholder="Search students, staff, or commands..." 
                    className="flex-1 h-14 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium text-base"
                  />
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100/80 border border-gray-200/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase">ESC</span>
                  </div>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-3 scroll-py-2 custom-scrollbar">
                  <Command.Empty className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 mb-3">
                        <History className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">No results found.</p>
                      <p className="text-xs text-gray-500 mt-1">Try searching for a student ID or staff name.</p>
                    </div>
                  </Command.Empty>

                  <Command.Group heading={<span className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Quick Navigation</span>}>
                    <CommandItem 
                      onSelect={() => runCommand(() => router.push(`/${tenantId}/dashboard`))}
                      icon={Settings} 
                      label="Admin Overview" 
                      shortcut="G D"
                    />
                    <CommandItem 
                      onSelect={() => runCommand(() => router.push(`/${tenantId}/students`))}
                      icon={Users} 
                      label="Student Records" 
                      shortcut="G S"
                    />
                    <CommandItem 
                      onSelect={() => runCommand(() => router.push(`/${tenantId}/fees`))}
                      icon={IndianRupee} 
                      label="Fee Management" 
                      shortcut="G F"
                    />
                  </Command.Group>

                  <Command.Group heading={<span className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-4">Recent Students</span>}>
                    <CommandItem 
                      onSelect={() => {}}
                      icon={History} 
                      label="Aarav Sharma (Class X-A)" 
                      sub="ADM: 2024091"
                    />
                    <CommandItem 
                      onSelect={() => {}}
                      icon={History} 
                      label="Sanya Gupta (Class VIII-C)" 
                      sub="ADM: 2024102"
                    />
                  </Command.Group>

                  <Command.Group heading={<span className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-4">Smart Actions</span>}>
                    <CommandItem 
                      onSelect={() => {}}
                      icon={MessageSquare} 
                      label="Send Broadcast SMS" 
                      color="text-blue-600"
                    />
                    <CommandItem 
                      onSelect={() => {}}
                      icon={GraduationCap} 
                      label="Generate Grade Report" 
                      color="text-purple-600"
                    />
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 shadow-sm text-[10px] font-bold text-gray-400">↑↓</kbd>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 shadow-sm text-[10px] font-bold text-gray-400">↵</kbd>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Select</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">OmniCampus AI</span>
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ 
  icon: Icon, 
  label, 
  sub, 
  shortcut, 
  onSelect,
  color = "text-gray-500"
}: { 
  icon: React.ComponentType<{ className?: string }>, 
  label: string, 
  sub?: string, 
  shortcut?: string,
  onSelect: () => void,
  color?: string
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center justify-between px-3 py-3 rounded-2xl cursor-pointer hover:bg-white aria-selected:bg-white aria-selected:shadow-md transition-all duration-200 group border border-transparent aria-selected:border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-gray-50 group-aria-selected:bg-white transition-colors ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-none">{label}</p>
          {sub && <p className="text-[10px] text-gray-400 mt-1 font-medium font-mono">{sub}</p>}
        </div>
      </div>
      {shortcut ? (
        <div className="flex items-center gap-1 opacity-40 group-aria-selected:opacity-100 transition-opacity">
          {shortcut.split(' ').map((s, i) => (
            <kbd key={i} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-400 border border-gray-200">{s}</kbd>
          ))}
        </div>
      ) : (
        <ArrowRight className="w-3 h-3 text-gray-300 opacity-0 group-aria-selected:opacity-100 -translate-x-2 group-aria-selected:translate-x-0 transition-all" />
      )}
    </Command.Item>
  );
}
