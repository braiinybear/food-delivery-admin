'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, BookOpen, Utensils } from 'lucide-react'
import { MenuCategory } from '@/types/restaurant'

interface MenuCategoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  category: MenuCategory | null
}

export function MenuCategoryDetailModal({
  isOpen,
  onClose,
  category,
}: MenuCategoryDetailModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!isOpen || !category || !mounted) return null

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
              <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              Category Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View complete information about this menu category
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
            {/* Category Header Section */}
            <div className="flex items-start gap-4">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <BookOpen size={32} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Restaurant: {category.restaurant?.name || 'N/A'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  Category ID
                </p>
                <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                  {category.id}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  Type
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {category.type || 'N/A'}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {category.items?.length || 0}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Created On
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {new Date(category.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Items Section */}
            {category.items && category.items.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Utensils size={16} />
                  Items in this Category ({category.items.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          item.isAvailable
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                This category contains {category.items?.length || 0} menu items. You can manage these items from the Menu Items tab.
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
