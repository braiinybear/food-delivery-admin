'use client'

import { useState } from 'react'
import { useCreateCoupon } from '@/hooks/useCoupons'
import { CreateCouponPayload, DiscountType } from '@/types/coupons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Loader2, Check } from 'lucide-react'

interface CreateCouponModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCouponModal({ isOpen, onClose }: CreateCouponModalProps) {
  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxDiscount: 0,
    minOrder: 0,
    usageLimit: 0,
    perUserLimit: 0,
    validFrom: '',
    validTo: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const { mutate: createCoupon, isPending } = useCreateCoupon()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required'
    } else if (!/^[A-Z0-9]{3,20}$/.test(formData.code)) {
      newErrors.code = 'Code must be 3-20 uppercase letters/numbers'
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0'
    }

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%'
    }

    if (formData.maxDiscount < 0) {
      newErrors.maxDiscount = 'Max discount cannot be negative'
    }

    if (formData.minOrder < 0) {
      newErrors.minOrder = 'Min order cannot be negative'
    }

    if (formData.usageLimit < 1) {
      newErrors.usageLimit = 'Usage limit must be at least 1'
    }

    if (formData.perUserLimit < 1) {
      newErrors.perUserLimit = 'Per user limit must be at least 1'
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Start date is required'
    }

    if (!formData.validTo) {
      newErrors.validTo = 'End date is required'
    }

    if (formData.validFrom && formData.validTo && new Date(formData.validFrom) >= new Date(formData.validTo)) {
      newErrors.validTo = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClose = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      maxDiscount: 0,
      minOrder: 0,
      usageLimit: 0,
      perUserLimit: 0,
      validFrom: '',
      validTo: '',
    })
    setErrors({})
    setShowSuccess(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    createCoupon(formData, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          handleClose()
        }, 1500)
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to create coupon';
        if (error && typeof error === 'object' && 'data' in error && error instanceof Error) {
          // If error is ApiError from api.ts
          const apiError = error as import('@/lib/api').ApiError;
          if (apiError.data && typeof apiError.data === 'object' && apiError.data !== null && 'message' in apiError.data) {
            errorMessage = (apiError.data as { message?: string }).message || errorMessage;
          }
        }
        setErrors({ submit: errorMessage });
      },
    })
  }

  // Calculate preview values
  const getDiscountPreview = () => {
    if (formData.discountType === 'PERCENTAGE') {
      return `${formData.discountValue}% OFF`
    }
    return `₹${formData.discountValue} OFF`
  }

  const validFromDate = formData.validFrom ? new Date(formData.validFrom).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'TBD'
  const validToDate = formData.validTo ? new Date(formData.validTo).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'TBD'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Create New Coupon
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Define the parameters for your promotional campaign.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <Check className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Coupon Created Successfully!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Your coupon is now active</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preview Section */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">PREVIEW</label>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex-1 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg">
                  <div className="text-center">
                    <p className="text-xs font-medium opacity-90">SAVE UP TO</p>
                    <p className="text-3xl font-bold">{getDiscountPreview()}</p>
                    <p className="text-xs opacity-75 mt-0.5">OFF DELIVERY</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formData.code || 'CODE'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Valid: {validFromDate} - {validToDate}</p>
                  <div className="mt-2 inline-block rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">LIVE PREVIEW</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form Grid */}
            <div className="grid grid-cols-4 gap-3">
              {/* Coupon Code */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="SUMMER24"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    setErrors({ ...errors, code: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.code ? 'border-red-500' : ''
                  }`}
                />
                {errors.code && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.code}
                  </p>
                )}
              </div>

              {/* Discount Type */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value as DiscountType })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERCENTAGE">% OFF</option>
                  <option value="FLAT">₹ OFF</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Value <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '50'}
                  value={formData.discountValue}
                  onChange={(e) => {
                    setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                    setErrors({ ...errors, discountValue: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.discountValue ? 'border-red-500' : ''
                  }`}
                />
                {errors.discountValue && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.discountValue}
                  </p>
                )}
              </div>

              {/* Max Discount */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Max (₹)
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.maxDiscount}
                  onChange={(e) => {
                    setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })
                    setErrors({ ...errors, maxDiscount: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.maxDiscount ? 'border-red-500' : ''
                  }`}
                />
                {errors.maxDiscount && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.maxDiscount}
                  </p>
                )}
              </div>

              {/* Min Order */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Min Order (₹)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.minOrder}
                  onChange={(e) => {
                    setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })
                    setErrors({ ...errors, minOrder: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.minOrder ? 'border-red-500' : ''
                  }`}
                />
                {errors.minOrder && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.minOrder}
                  </p>
                )}
              </div>

              {/* Usage Limit */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Limit <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => {
                    setFormData({ ...formData, usageLimit: parseFloat(e.target.value) || 0 })
                    setErrors({ ...errors, usageLimit: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.usageLimit ? 'border-red-500' : ''
                  }`}
                />
                {errors.usageLimit && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.usageLimit}
                  </p>
                )}
              </div>

              {/* Per User Limit */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  Per User <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.perUserLimit}
                  onChange={(e) => {
                    setFormData({ ...formData, perUserLimit: parseFloat(e.target.value) || 0 })
                    setErrors({ ...errors, perUserLimit: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.perUserLimit ? 'border-red-500' : ''
                  }`}
                />
                {errors.perUserLimit && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.perUserLimit}
                  </p>
                )}
              </div>

              {/* Valid From */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  From <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => {
                    setFormData({ ...formData, validFrom: e.target.value })
                    setErrors({ ...errors, validFrom: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.validFrom ? 'border-red-500' : ''
                  }`}
                />
                {errors.validFrom && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.validFrom}
                  </p>
                )}
              </div>

              {/* Valid To */}
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-white mb-1 block">
                  To <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => {
                    setFormData({ ...formData, validTo: e.target.value })
                    setErrors({ ...errors, validTo: '', validFrom: '' })
                  }}
                  className={`text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                    errors.validTo ? 'border-red-500' : ''
                  }`}
                />
                {errors.validTo && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.validTo}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-2">
                <AlertCircle className="size-3 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="text-xs h-8 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 size={12} className="mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
