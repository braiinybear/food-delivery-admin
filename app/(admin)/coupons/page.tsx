'use client'
import { useState, useMemo } from 'react'
import { useCoupons, useActivateCoupon, useDeactivateCoupon } from '@/hooks/useCoupons'
import { CreateCouponModal } from '@/components/create-coupon-modal'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, Plus, MoreVertical, Check, X } from 'lucide-react'
import { Coupon } from '@/types/coupons'

interface StatCard {
  label: string
  value: string | number
  subtext?: string
  icon: React.ReactNode
  trend?: string
}

export default function CouponsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: coupons, isLoading } = useCoupons()
  const { mutate: activateCoupon, isPending: isActivating } = useActivateCoupon()
  const { mutate: deactivateCoupon, isPending: isDeactivating } = useDeactivateCoupon()

  // Calculate statistics
  const stats = useMemo(() => {
    if (!coupons || coupons.length === 0) {
      return {
        totalActive: 0,
        totalRedemptions: 0,
        revenueSaved: 0,
      }
    }

    const totalActive = coupons.filter((c) => c.isActive).length
    const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesUsed, 0)
    const revenueSaved = coupons.reduce((sum, c) => {
      const discountPerUse = c.discountType === 'PERCENTAGE'
        ? (c.discountValue / 100) * 50 // Assuming ~$50 avg order
        : c.discountValue
      return sum + discountPerUse * c.timesUsed
    }, 0)

    return {
      totalActive,
      totalRedemptions,
      revenueSaved: Math.round(revenueSaved),
    }
  }, [coupons])

  const statCards: StatCard[] = [
    {
      label: 'Total Active Coupons',
      value: stats.totalActive,
      subtext: 'Currently running campaigns',
      icon: (
        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3">
          <svg className="size-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
      ),
    },
    {
      label: 'Total Redemptions',
      value: stats.totalRedemptions.toLocaleString(),
      subtext: 'Coupons used this month',
      icon: (
        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3">
          <svg className="size-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
    {
      label: 'Revenue Saved',
      value: `₹${stats.revenueSaved.toLocaleString()}`,
      subtext: 'Across all campaigns',
      icon: (
        <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3">
          <svg className="size-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
  ]

  const handleActivate = (id: string) => {
    activateCoupon(id)
  }

  const handleDeactivate = (id: string) => {
    deactivateCoupon(id)
  }

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validTo = new Date(coupon.validTo)

    if (now < validFrom) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
          <span className="size-2 rounded-full bg-yellow-500"></span>
          Scheduled
        </span>
      )
    }

    if (now > validTo) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-400">
          <span className="size-2 rounded-full bg-gray-500"></span>
          Expired
        </span>
      )
    }

    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
          <span className="size-2 rounded-full bg-red-500"></span>
          Inactive
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
        <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
        Active
      </span>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Coupon Directory</h1>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Manage and monitor your promotional performance.</p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                <Plus size={16} />
                Create Coupon
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:shadow-md dark:hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  {stat.subtext && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{stat.subtext}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="px-6 pb-8">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : !coupons || coupons.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto size-12 text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No coupons yet</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create your first coupon to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white dark:bg-slate-950">
                  <TableRow className="border-b border-slate-200 dark:border-slate-700">
                    <TableHead className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">Coupon Code</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">Discount</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">Usage (Used/Limit)</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">Validity Period</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{coupon.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Flat Discount'}
                            {coupon.maxDiscount > 0 && ` • Max ₹${coupon.maxDiscount}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="mb-2 flex justify-between">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {coupon.timesUsed}/{coupon.usageLimit}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {Math.round((coupon.timesUsed / coupon.usageLimit) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                              style={{
                                width: `${Math.min((coupon.timesUsed / coupon.usageLimit) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            {coupon.isActive ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(coupon.id)}
                                disabled={isDeactivating}
                                className="text-slate-900 dark:text-white cursor-pointer"
                              >
                                <X size={14} className="mr-2" />
                                {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleActivate(coupon.id)}
                                disabled={isActivating}
                                className="text-slate-900 dark:text-white cursor-pointer"
                              >
                                <Check size={14} className="mr-2" />
                                {isActivating ? 'Activating...' : 'Activate'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        {coupons && coupons.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">1 to {coupons.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{coupons.length}</span> coupons
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}