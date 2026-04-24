'use client'

import { useState} from 'react'
import { useCreateUser } from '@/hooks/useUsers'
import { CreateUserPayload, CreateUserRole } from '@/types/users'
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

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
}

const ROLE_OPTIONS: { value: CreateUserRole; label: string }[] = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'RESTAURANT_MANAGER', label: 'Restaurant Manager' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner' },
]

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const { mutate: createUser, isPending } = useCreateUser()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', role: 'CUSTOMER' })
    setErrors({})
    setShowSuccess(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    createUser(formData, {
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => {
          handleClose()
        }, 1500)
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Failed to create user'
        setErrors({ submit: errorMessage })
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Create New User
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Add a new user to the system. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">User Created!</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">The new user has been added successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Error Banner */}
            {errors.submit && (
              <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 ${
                  errors.name ? 'border-red-500 dark:border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 ${
                  errors.email ? 'border-red-500 dark:border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 ${
                  errors.password ? 'border-red-500 dark:border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as CreateUserRole })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>handle

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
