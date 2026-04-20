"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ClipboardCheck,
  UtensilsCrossed,
  Users,
  Tag,
  Gift,
  LogOut,
} from "lucide-react"

const navItems = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "Requests",    href: "/requests",    icon: ClipboardCheck },
  { label: "Restaurants", href: "/restaurants", icon: UtensilsCrossed },
  { label: "Users",       href: "/users",       icon: Users },
  { label: "Coupons",     href: "/coupons",     icon: Tag },
  { label: "Referral",    href: "/referral",    icon: Gift },
]

export function AppSidebar() {
  const pathname  = usePathname()
  const { user, signOut } = useAuth()
  const { toggleSidebar, isMobile } = useSidebar()

  const handleSignOut = async () => {
    try { await signOut() } catch { /* ignore */ }
    window.location.href = "/sign-in"
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "A"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <Sidebar variant="sidebar" className="p-0 bg-white dark:bg-slate-950" collapsible="icon">

      {/* ── Header / Brand ──────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border bg-white dark:bg-slate-900 dark:border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent cursor-default gap-3"
            >
              {/* Logo icon */}
              <div
                className="w-6 h-5 rounded-md flex items-center justify-center text-white shrink-0 shadow-lg text-sm animate-in zoom-in duration-500"
                style={{ background: "linear-gradient(135deg,#f97316,#e11d48)" }}
              >
                🍕
              </div>

              {/* Brand text */}
              <div className="flex flex-col flex-1 truncate text-left leading-none gap-0.5 group-data-[state=collapsed]:hidden">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Braiiny Food</span>
                <span className="text-[9px] font-bold text-primary dark:text-indigo-400 uppercase tracking-[0.15em]">
                  Admin Portal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <SidebarContent className="px-1 py-2 bg-white dark:bg-slate-950">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[state=collapsed]:hidden">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      size="lg"
                      className={[
                        "rounded-xl h-11 gap-3 text-[15px] font-medium transition-all",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800",
                      ].join(" ")}
                    >
                      <Link
                        href={item.href}
                        onClick={() => { if (isMobile) toggleSidebar() }}
                        className="flex items-center justify-start gap-3 group-data-[state=collapsed]:justify-center"
                      >
                        <item.icon
                          size={20}
                          strokeWidth={isActive ? 2.2 : 1.8}
                          className={isActive ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"}
                        />
                        <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User ────────────────────────────────────────────── */}
      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border bg-white dark:bg-slate-900 dark:border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full rounded-xl gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-default"
              asChild
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-extrabold shrink-0 shadow-sm leading-none"
                  style={{ background: "linear-gradient(135deg,#f97316,#e11d48)" }}
                >
                  {getInitials(user?.name)}
                </div>

                {/* User info */}
                <div className="flex flex-col flex-1 truncate text-left leading-none gap-0.5 group-data-[state=collapsed]:hidden">
                  <span className="text-[15px] font-semibold truncate text-slate-900 dark:text-white">
                    {user?.name ?? "Admin"}
                  </span>
                  <span className="text-[12px] text-muted-foreground truncate dark:text-slate-400">
                    {user?.email ?? ""}
                  </span>
                </div>

                {/* Sign out */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSignOut()
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 text-muted-foreground dark:text-slate-400 shrink-0 ml-auto transition-colors relative z-10 group-data-[state=collapsed]:ml-0"
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}