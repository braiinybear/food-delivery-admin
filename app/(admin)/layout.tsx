'use client'

import { SidebarProvider, SidebarTrigger, SidebarInset} from "@/components/ui/sidebar"
import { AppSidebar} from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ModalProvider, useModal } from "@/lib/modal-context"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ModalProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ModalProvider>
  );
}

function AdminLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isModalOpen } = useModal()

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen w-full relative">
          <div className={`flex min-h-screen w-full relative transition-all duration-300 ${isModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen relative">
              <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-6 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2 p-2">
                  <SidebarTrigger className="-ml-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" />
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white tracking-tight">Admin Panel</span>
                  </div>
                </div>
                <ThemeToggle />
              </header>
              <main className="flex-1 bg-white dark:bg-slate-950">
                <div className="h-full px-6 py-6">
                  {children}
                </div>
              </main>
            </SidebarInset>
          </div>
          {/* Global Portal for Modals (placed outside the blurred container) */}
          <div id="modal-root" className="fixed z-50" />
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
