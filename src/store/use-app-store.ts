import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AppState {
  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Academic Year
  academicYear: string
  setAcademicYear: (year: string) => void

  // Selected Child (for parent role)
  selectedChildId: string | null
  setSelectedChildId: (id: string | null) => void

  // Notifications
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  clearUnread: () => void

  // Theme
  theme: "light" | "dark"
  toggleTheme: () => void

  // Language
  language: string
  setLanguage: (lang: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      // Academic Year
      academicYear: "2024-2025",
      setAcademicYear: (year) => set({ academicYear: year }),

      // Selected Child
      selectedChildId: null,
      setSelectedChildId: (id) => set({ selectedChildId: id }),

      // Notifications
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
      incrementUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
      clearUnread: () => set({ unreadCount: 0 }),

      // Theme
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      // Language
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "omnicampus-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        academicYear: state.academicYear,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)
