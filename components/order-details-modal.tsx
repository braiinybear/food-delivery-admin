'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { AdminOrder } from '@/types/dashboard'

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  order: AdminOrder | null
  formatCurrency: (value: number) => string
  getStatusBadgeColor: (status: string) => string
  getStatusLabel: (status: string) => string
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  formatCurrency,
  getStatusBadgeColor,
  getStatusLabel,
}: OrderDetailsModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Break the synchronous render cycle to satisfy strict reactive rules
    const timeout = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, mounted])

  // Only render on client to avoid hydration mismatch with Portals
  if (!mounted) return null
  if (!isOpen || !order) return null

  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-9998 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative z-9999 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Order Details
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
              <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 break-all sm:break-normal">#{order?.id}</span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Placed on {order?.placedAt ? new Date(order.placedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getStatusBadgeColor(order?.status)}`}>
              {getStatusLabel(order?.status)}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="space-y-6 px-4 sm:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-widest">Customer</h3>
                <div className="space-y-1">
                  <p className="text-sm text-slate-900 dark:text-white font-semibold truncate">{order.customer?.name || "N/A"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{order.customer?.email || "N/A"}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-widest">Restaurant</h3>
                <p className="text-sm text-slate-900 dark:text-white font-semibold truncate">{order.restaurant?.name || "N/A"}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-widest">Payment</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-900 dark:text-white font-semibold">{order.paymentMode || "N/A"}</p>
                  <span className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-widest">Status</h3>
                <p className="text-sm text-slate-900 dark:text-white font-semibold">{getStatusLabel(order.status)}</p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/40 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800 sm:col-span-2 lg:col-span-1">
                <h3 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-2.5 uppercase tracking-widest">Total</h3>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(order.totalAmount || 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Order Breakdown</h4>
                  <div className="space-y-3 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Item Total</span>
                      <span className="font-medium dark:text-slate-300">{formatCurrency(order.itemTotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Delivery Charge</span>
                      <span className="font-medium dark:text-slate-300">{formatCurrency(order.deliveryCharge || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Platform Fee</span>
                      <span className="font-medium dark:text-slate-300">{formatCurrency(order.platformFee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tax</span>
                      <span className="font-medium dark:text-slate-300">{formatCurrency(order.tax || 0)}</span>
                    </div>
                    {order.driverTip && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Driver Tip</span>
                        <span className="font-medium dark:text-slate-300">{formatCurrency(order.driverTip)}</span>
                      </div>
                    )}
                    {order.discount && (
                      <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                        <span>Discount</span>
                        <span className="font-bold">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                      <span>Grand Total</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(order.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/50">
                   <p className="text-xs text-blue-700/70 dark:text-blue-400/70 leading-relaxed italic">
                    This order was placed via Braiiny Food Admin Portal. All taxes and platform fees are calculated as per standard billing guidelines.
                   </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Delivery Timeline</h4>
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                  <TimelineItem label="Order Placed" time={order.placedAt} completed={!!order.placedAt} />
                  <TimelineItem label="Order Accepted" time={order.acceptedAt} completed={!!order.acceptedAt} />
                  <TimelineItem label="Picked Up" time={order.pickedUpAt} completed={!!order.pickedUpAt} />
                  <TimelineItem label="Delivered" time={order.deliveredAt} completed={!!order.deliveredAt} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent
}

function TimelineItem({ label, time, completed }: { label: string; time?: string | null; completed: boolean }) {
  return (
    <div className="flex gap-4 relative z-10">
      <div className={`w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-800 mt-1 shrink-0 ${
        completed ? 'border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-50 dark:ring-indigo-900/30' : 'border-slate-300 dark:border-slate-600'
      }`}>
        {completed && <div className="w-1.5 h-1.5 bg-indigo-600 dark:border-indigo-400 rounded-full m-auto mt-0.5" />}
      </div>
      <div>
        <p className={`text-sm font-bold ${completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {time ? new Date(time).toLocaleString() : "Pending"}
        </p>
      </div>
    </div>
  )
}
