'use client'
import { useState, useMemo } from 'react'
import { useAdminUsers, useChangeUserRole } from '@/hooks/useUsers'
import { CreateUserModal } from '@/components/create-user-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Download,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  TrendingUp,
  Loader2,
  MoreHorizontal,
  UserCog,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { UserRole } from '@/types/users'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; label: string }> = {
  CUSTOMER: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', label: 'Customer' },
  ADMIN: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', label: 'Admin' },
  RESTAURANT_MANAGER: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', label: 'Manager' },
  DELIVERY_PARTNER: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', label: 'Driver' },
  SUPPORT_AGENT: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', label: 'Support' },
}



export default function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useAdminUsers({
    limit: 19,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
  })

  const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole()

  // Memoize the reference date to avoid recalculating on every render
  const sevenDaysAgo = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }, [])

  // Get current page data and apply filters
  const currentPageData = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return []
    // Get the last page (current page being viewed)
    const lastPage = data.pages[data.pages.length - 1]
    return lastPage.data.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const createdAt = new Date(user.createdAt).getTime()
      const matchesFromDate = !dateRange.from || createdAt >= new Date(dateRange.from).getTime()
      const matchesToDate = !dateRange.to || createdAt <= new Date(dateRange.to).setHours(23, 59, 59, 999)

      return matchesSearch && matchesFromDate && matchesToDate
    })
  }, [data, searchTerm, dateRange])

  // Stats calculations (from all fetched pages)
  const stats = useMemo(() => {
    if (!data?.pages) return { totalUsers: 0, adminCount: 0, newUsers: 0 }
    
    const allFlatUsers = data.pages.flatMap((page) => page.data)
    const totalUsers = data.pages[0]?.total || 0
    const adminCount = allFlatUsers.filter((u) => u.role === 'ADMIN').length
    
    const newUsers = allFlatUsers.filter((u) => {
      const createdDate = new Date(u.createdAt)
      return createdDate > sevenDaysAgo
    }).length

    return { totalUsers, adminCount, newUsers }
  }, [data?.pages, sevenDaysAgo])

  // Export to Excel (all users from all pages)
  const handleExportExcel = () => {
    const allUsers = data?.pages.flatMap((page) => page.data) || []
    const exportData = allUsers.map((user) => ({
      'User ID': user.id,
      'Name': user.name,
      'Email': user.email || 'N/A',
      'Phone': user.phoneNumber || 'N/A',
      'Role': ROLE_COLORS[user.role]?.label || user.role,
      'Referral Code': user.referralCode,
      'Created Date': new Date(user.createdAt).toLocaleDateString(),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')

    XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Print functionality
  const handlePrint = () => {
    const allUsers = data?.pages.flatMap((page) => page.data) || []
    const printContent = `
      <html>
        <head>
          <title>Users Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4C1D95; margin-bottom: 30px; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-box { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #4C1D95; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; color: #374151; }
            tr:nth-child(even) { background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Users Report</h1>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${stats.totalUsers}</div>
              <div>Total Users</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${stats.adminCount}</div>
              <div>Active Admins</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${stats.newUsers}</div>
              <div>New Signups (7D)</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${allUsers
                .map(
                  (user) =>
                    `<tr>
                <td>${user.name}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${ROLE_COLORS[user.role]?.label || user.role}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow?.document.write(printContent)
    printWindow?.document.close()
    printWindow?.print()
  }

  const currentPageNumber = data?.pages.length || 1

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Directory</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage, audit, and curate your user ecosystem.</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 py-2 h-10"
        >
          + Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Total Users
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">↑ 14.2% this month</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Active Admins */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Active Admins
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.adminCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Team members</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>

        {/* New Signups */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                New Signups (7D)
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.newUsers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">72% Goal</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-62.5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500 dark:text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="RESTAURANT_MANAGER">Manager</option>
              <option value="DELIVERY_PARTNER">Driver</option>
              <option value="SUPPORT_AGENT">Support</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                className="bg-transparent text-sm text-slate-900 dark:text-white outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                className="bg-transparent text-sm text-slate-900 dark:text-white outline-none focus:ring-0"
              />
            </div>
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({ from: '', to: '' })}
                className="text-xs text-indigo-600 hover:text-indigo-700 h-8 px-2"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Export & Print */}
          <div className="flex gap-2">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-2"
            >
              <Download size={18} />
              Export
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 gap-2"
            >
              <Printer size={18} />
              Print
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>
            Showing <span className="font-semibold text-slate-900 dark:text-white">{currentPageData.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{stats.totalUsers}</span> users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[600px] h-[calc(100vh-350px)] mb-6">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-transparent shadow-sm">
                <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md">
                  User Profile
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md">
                  Status & Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md">
                  Joined Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && currentPageData.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-400">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Skeleton className="h-8 w-8 rounded-md mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : currentPageData.length > 0 ? (
                currentPageData.map((user) => (
                  <TableRow key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        {/* User Profile */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email || 'N/A'}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status & Role */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                ROLE_COLORS[user.role]?.bg
                              } ${ROLE_COLORS[user.role]?.text}`}
                            >
                              {ROLE_COLORS[user.role]?.label || user.role}
                            </span>
                          </div>
                        </TableCell>

                        {/* Joined Date */}
                        <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white mx-auto"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                              <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="text-xs cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-700">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-700">
                                Edit Profile
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700" />
                              
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-xs cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-700 gap-2">
                                  <UserCog size={14} />
                                  Change Role
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                  {Object.entries(ROLE_COLORS).map(([role, config]) => (
                                    <DropdownMenuItem
                                      key={role}
                                      disabled={user.role === role || isChangingRole}
                                      onClick={() => changeRole({ userId: user.id, role: role as UserRole })}
                                      className="text-xs cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-700"
                                    >
                                      {config.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>

                              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700" />
                              <DropdownMenuItem className="text-xs text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 font-medium">
                                Suspend Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-slate-600 dark:text-slate-400">No users found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Backend Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Page <span className="font-semibold text-slate-900 dark:text-white">{currentPageNumber}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.history.back()}
                  disabled={currentPageNumber === 1}
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 flex items-center justify-center"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </Button>
              </div>
            </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}