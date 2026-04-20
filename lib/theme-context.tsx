"use client"

import React, { createContext, useContext, useState, useLayoutEffect, useEffect } from "react"

interface ThemeContextType {
  dark: boolean
  toggleTheme: () => void
}

interface ThemeState {
  dark: boolean
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>({ dark: false, mounted: false })

  // ─── Initialize theme on client-side only (useLayoutEffect runs before paint) ──
  useLayoutEffect(() => {
    // Get initial theme from localStorage or system preference
    const storedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = storedTheme === "dark" || (storedTheme === null && prefersDark)

    // Apply theme to DOM immediately
    if (isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }

    // Update state with both values in a single call
    // This is intentional for one-time initialization - see https://react.dev/learn/you-might-not-need-an-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setState({ dark: isDark, mounted: true })
  }, [])

  // ─── Apply theme to DOM when dark state changes ────────────────────────────────
  useEffect(() => {
    if (state.mounted) {
      if (state.dark) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    }
  }, [state.dark, state.mounted])

  const toggleTheme = () => setState(prev => ({ ...prev, dark: !prev.dark }))

  return (
    <ThemeContext.Provider value={{ dark: state.dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
