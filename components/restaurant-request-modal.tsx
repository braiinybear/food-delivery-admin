'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, XCircle, MapPin, Phone, Mail, DollarSign, UtensilsCrossed } from 'lucide-react'
import { RestaurantRequest, ApproveRestaurantRequestResponse, RejectRestaurantRequestResponse } from '@/types/request'
import { UseMutationResult } from '@tanstack/react-query'

interface RestaurantRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: RestaurantRequest | null
  approveMutation: UseMutationResult<ApproveRestaurantRequestResponse, Error, string, unknown>
  rejectMutation: UseMutationResult<RejectRestaurantRequestResponse, Error, { id: string; reason?: string }, unknown>
}

export function RestaurantRequestDetailModal({
  isOpen,
  onClose,
  request,
  approveMutation,
  rejectMutation,
}: RestaurantRequestDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
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

  const handleApprove = () => {
    if (request?.id) {
      approveMutation.mutate(request.id, {
        onSuccess: () => {
          onClose()
          setShowRejectForm(false)
          setRejectReason("")
        },
      })
    }
  }

  const handleReject = () => {
    if (request?.id) {
      rejectMutation.mutate(
        { id: request.id, reason: rejectReason },
        {
          onSuccess: () => {
            onClose()
            setShowRejectForm(false)
            setRejectReason("")
          },
        }
      )
    }
  }

  if (!mounted || !isOpen || !request) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative z-[9999] w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed size={24} className="text-orange-600 dark:text-orange-400" />
              Restaurant Application
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ID: <span className="font-mono">{request?.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                request?.status === 'APPROVED'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : request?.status === 'REJECTED'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}
            >
              {request?.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="space-y-6 px-8 py-6">
            {/* Restaurant Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Restaurant Name */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Restaurant Name
                </h3>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{request?.restaurantName}</p>
              </div>

              {/* Cost For Two */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Cost For Two
                </h3>
                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <DollarSign size={18} className="text-green-600" />
                  {request?.costForTwo}
                </p>
              </div>
            </div>

            {/* Owner & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Owner */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
                  Owner
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{request?.user?.name}</p>
                  <a
                    href={`mailto:${request?.user?.email}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Mail size={14} />
                    {request?.user?.email}
                  </a>
                  {request?.user?.phoneNumber && (
                    <a
                      href={`tel:${request?.user?.phoneNumber}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Phone size={14} />
                      {request?.user?.phoneNumber}
                    </a>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 md:col-span-2">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Address
                </h3>
                <p className="text-sm text-slate-900 dark:text-white flex items-start gap-2">
                  <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{request?.address}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                  📍 {request?.lat}, {request?.lng}
                </p>
              </div>
            </div>

            {/* Cuisine & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cuisines */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
                  Cuisine Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {request?.cuisineTypes?.map((cuisine) => (
                    <span
                      key={cuisine}
                      className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Description
                </h3>
                <p className="text-sm text-slate-900 dark:text-white leading-relaxed">{request?.description}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FSSAI & GST */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">
                  Compliance Documents
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">FSSAI Code:</p>
                    <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded">
                      {request?.fssaiCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">GST Number:</p>
                    <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded">
                      {request?.gstNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Files */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-widest">
                  Media Files
                </h3>
                <div className="space-y-2 text-sm">
                  {request?.logoUrl && (
                    <p>
                      <span className="text-slate-600 dark:text-slate-400">Logo:</span>{' '}
                      <a
                        href={request.logoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </a>
                    </p>
                  )}
                  {request?.bannerUrl && (
                    <p>
                      <span className="text-slate-600 dark:text-slate-400">Banner:</span>{' '}
                      <a
                        href={request.bannerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </a>
                    </p>
                  )}
                  {request?.fssaiDocUrl && (
                    <p>
                      <span className="text-slate-600 dark:text-slate-400">FSSAI Doc:</span>{' '}
                      <a
                        href={request.fssaiDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {request?.status === 'REJECTED' && request?.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/50">
                <h3 className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-widest">
                  Rejection Reason
                </h3>
                <p className="text-sm text-red-900 dark:text-red-100">{request.rejectionReason}</p>
              </div>
            )}

            {/* Approval/Rejection Form */}
            {request?.status === 'PENDING' && (
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                {!showRejectForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm font-bold"
                    >
                      <CheckCircle2 size={16} />
                      {approveMutation.isPending ? 'Approving...' : 'Approve Request'}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                    >
                      <XCircle size={18} />
                      Reject Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/50">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Rejection Reason</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full px-4 py-2 rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        disabled={rejectMutation.isPending || !rejectReason.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white rounded-lg transition-colors font-semibold text-sm"
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectReason("")
                        }}
                        className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-semibold text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent
}
