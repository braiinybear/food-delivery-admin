"use client"

import { useTheme } from "@/lib/theme-context"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { dark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-slate-600" />
      )}
    </button>
  )
}
