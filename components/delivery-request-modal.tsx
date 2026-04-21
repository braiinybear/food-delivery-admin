'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, XCircle, Phone, Mail, Truck, FileText } from 'lucide-react'
import { DeliveryRequest, ApproveDeliveryRequestResponse, RejectDeliveryRequestResponse } from '@/types/request'
import { UseMutationResult } from '@tanstack/react-query'

interface DeliveryRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: DeliveryRequest | null
  approveMutation: UseMutationResult<ApproveDeliveryRequestResponse, Error, string, unknown>
  rejectMutation: UseMutationResult<RejectDeliveryRequestResponse, Error, { id: string; reason?: string }, unknown>
}

export function DeliveryRequestDetailModal({
  isOpen,
  onClose,
  request,
  approveMutation,
  rejectMutation,
}: DeliveryRequestDetailModalProps) {
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
              <Truck size={24} className="text-blue-600 dark:text-blue-400" />
              Delivery Partner Application
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
            {/* Driver Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Driver Name */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Driver Name
                </h3>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{request?.user?.name}</p>
              </div>

              {/* Email */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Email
                </h3>
                <a
                  href={`mailto:${request?.user?.email}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  <Mail size={16} />
                  {request?.user?.email}
                </a>
              </div>

              {/* Phone */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                  Phone Number
                </h3>
                <a
                  href={`tel:${request?.user?.phoneNumber}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                >
                  <Phone size={16} />
                  {request?.user?.phoneNumber}
                </a>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vehicle Type */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest">
                  Vehicle Type
                </h3>
                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck size={20} className="text-blue-600 dark:text-blue-400" />
                  {request?.vehicleType}
                </p>
              </div>

              {/* License Number */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest">
                  License Number
                </h3>
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{request?.licenseNumber}</p>
              </div>

              {/* Vehicle Plate */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest">
                  Vehicle Plate
                </h3>
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white text-center">{request?.vehiclePlate}</p>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-slate-600 dark:text-slate-400" />
                Required Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License Documents */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    License Documents
                  </h4>
                  <div className="space-y-2">
                    {request?.licenseFrontUrl && (
                      <p>
                        <span className="text-xs text-slate-600 dark:text-slate-400">License Front:</span>{' '}
                        <a
                          href={request.licenseFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                    {request?.licenseBackUrl && (
                      <p>
                        <span className="text-xs text-slate-600 dark:text-slate-400">License Back:</span>{' '}
                        <a
                          href={request.licenseBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle & Profile Documents */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Vehicle & Profile
                  </h4>
                  <div className="space-y-2">
                    {request?.vehicleRcUrl && (
                      <p>
                        <span className="text-xs text-slate-600 dark:text-slate-400">Vehicle RC:</span>{' '}
                        <a
                          href={request.vehicleRcUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                    {request?.profilePicUrl && (
                      <p>
                        <span className="text-xs text-slate-600 dark:text-slate-400">Profile Picture:</span>{' '}
                        <a
                          href={request.profilePicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Applied On</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(request?.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Updated</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(request?.updatedAt).toLocaleString()}
                </p>
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
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white rounded-lg transition-colors font-semibold"
                    >
                      <CheckCircle2 size={18} />
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
