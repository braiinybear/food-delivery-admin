'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, UtensilsCrossed, Clock, Flame } from 'lucide-react'
import { MenuItem } from '@/types/restaurant'

interface MenuItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: MenuItem | null
}

export function MenuItemDetailModal({
  isOpen,
  onClose,
  item,
}: MenuItemDetailModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!isOpen || !item || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9998 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative z-9999 w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-orange-600 dark:text-orange-400" />
              Item Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View complete information about this menu item
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="space-y-6 px-8 py-6">
            {/* Item Header Section */}
            <div className="flex items-start gap-4">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-28 h-28 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <UtensilsCrossed size={40} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {item.category?.name || 'N/A'}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {item.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                  Item ID
                </p>
                <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                  {item.id}
                </p>
              </div>

              <div
                className={`rounded-lg p-4 border ${
                  item.type === 'VEG'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                    : item.type === 'NON_VEG'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                    : 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800'
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                    item.type === 'VEG'
                      ? 'text-green-600 dark:text-green-400'
                      : item.type === 'NON_VEG'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  Type
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.type || 'N/A'}
                </p>
              </div>

              <div
                className={`rounded-lg p-4 border ${
                  item.isAvailable
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                    item.isAvailable
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Status
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.isAvailable ? '✓ Available' : '✗ Unavailable'}
                </p>
              </div>

              <div
                className={`rounded-lg p-4 border ${
                  item.isBestseller
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800'
                    : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                    item.isBestseller
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Best Seller
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.isBestseller ? '⭐ Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              {item.prepTime && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                  <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Prep Time
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.prepTime} mins
                    </p>
                  </div>
                </div>
              )}

              {item.spiceLevel && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800 flex items-center gap-3">
                  <Flame size={20} className="text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Spice Level
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.spiceLevel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {new Date(item.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800">
              <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                This item belongs to the {item.category?.name || 'unknown'} category. You can manage item availability and details from this view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent
}
