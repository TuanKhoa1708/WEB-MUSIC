import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle2, Save, Upload, Loader2, AlertTriangle, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateMeService } from '@/services/user.service'
import { uploadFilesApi } from '@/api/song.api' // Reuse upload endpoint for images
import { requestRevokeRoleApi, getMyArtistRequestApi } from '@/api/artistRequest.api'
import toast from 'react-hot-toast'

export function ArtistProfilePage() {
  const { user } = useAuth() // login updates AuthContext state
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Revocation request state
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)
  const [hasPendingRevoke, setHasPendingRevoke] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    avatarUrl: '',
  })

  // Initialize from context
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        avatarUrl: user.avatarUrl || '',
      })
    }
  }, [user])

  // Check if artist already has a pending revoke request
  useEffect(() => {
    getMyArtistRequestApi()
      .then((req) => {
        if (req?.status === 'revoke_pending') setHasPendingRevoke(true)
      })
      .catch((err) => {
        console.log('No pending revoke request found or error:', err.message)
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('coverFile', file) // Using coverFile field from existing upload endpoint

      const res = await uploadFilesApi(uploadData)
      if (res.success && res.data.coverUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: res.data.coverUrl! }))
        toast.success('Avatar uploaded successfully')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updatedUser = await updateMeService(formData)
      // The updateMeService returns the updated user object.
      // We don't have a specific `updateUser` function in AuthContext, 
      // but if we need to update context, we can just trigger a reload or re-fetch.
      // Since `user` is in state from login, for a robust update we should really 
      // have an `updateUser` in AuthContext. If not, the change will persist to DB 
      // and reflect on next login. Let's show a toast for now.
      toast.success('Profile updated successfully')
      
      // Update local context if possible (hack: we can't easily without modifying AuthContext, 
      // but the DB is updated. The user will see changes on next reload).
      // We will just let the form show the new data.
      setFormData({
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatarUrl,
      })

    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevokeSubmit = async () => {
    if (!revokeReason.trim()) {
      toast.error('Please provide a reason for your request')
      return
    }
    setIsRevoking(true)
    try {
      await requestRevokeRoleApi(revokeReason.trim())
      toast.success('Revocation request submitted! Admin will review it shortly.')
      setShowRevokeModal(false)
      setHasPendingRevoke(true)
      setRevokeReason('')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit request')
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-[800px] mx-auto">
      {/* ── Page header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center text-[#3FD6FF] shrink-0">
            <UserCircle2 size={28} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-[-0.03em] leading-tight m-0">
              My Profile
            </h1>
            <p className="text-[15px] text-[#888] mt-1 m-0">
              Manage your personal information
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Profile Form ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#121212] border border-white/5 rounded-[20px] p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative w-[100px] h-[100px] rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 size={40} className="text-[#555]" />
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-[#3FD6FF]" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3FD6FF]/10 text-[#3FD6FF] font-semibold text-[13px] cursor-pointer hover:bg-[#3FD6FF]/20 transition-colors">
                <Upload size={16} />
                Upload New Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-[#666] mt-2 m-0">
                Recommended: Square image, at least 400x400px.
              </p>
            </div>
          </div>

          <div className="h-[1px] bg-white/5" />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] text-[#888] font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm outline-none focus:border-[#3FD6FF]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#888] font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm outline-none focus:border-[#3FD6FF]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] text-[#888] font-semibold mb-2">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/5 text-[#666] text-sm outline-none cursor-not-allowed"
            />
            <p className="text-xs text-[#555] mt-2 m-0">
              Email changes must be requested through support.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className={`flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-br from-[#3FD6FF] to-[#2094ff] border-none text-black text-sm font-bold shadow-[0_4px_20px_rgba(63,214,255,0.3)] transition-all ${
                (isSaving || isUploading) ? 'cursor-wait opacity-70' : 'cursor-pointer hover:brightness-110'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* ── Danger Zone ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 bg-[#FF5B5B]/5 border border-[#FF5B5B]/15 rounded-[20px] p-7"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <AlertTriangle size={18} color="#FF5B5B" />
          <h2 className="text-base font-extrabold text-[#FF5B5B] tracking-[-0.02em] m-0">
            Danger Zone
          </h2>
        </div>
        <p className="text-[13px] text-[#666] mb-5 leading-relaxed">
          Requesting role revocation will remove your Artist status. All your songs will be permanently deleted 
          after admin approval. This action cannot be undone.
        </p>

        {hasPendingRevoke ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F7B500]/10 border border-[#F7B500]/25 text-[#F7B500] text-[13px] font-semibold">
            <AlertTriangle size={14} />
            Revocation request pending admin review
          </div>
        ) : (
          <button
            onClick={() => setShowRevokeModal(true)}
            className="inline-flex items-center gap-2 h-[42px] px-5 rounded-xl bg-[#FF5B5B]/10 hover:bg-[#FF5B5B]/15 border border-[#FF5B5B]/25 hover:border-[#FF5B5B]/40 text-[#FF5B5B] text-[13px] font-bold cursor-pointer transition-all duration-200"
          >
            <AlertTriangle size={15} />
            Request Artist Role Revocation
          </button>
        )}
      </motion.div>

      {/* ── Revoke Confirmation Modal ─────────────────── */}
      <AnimatePresence>
        {showRevokeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) setShowRevokeModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#111] border border-[#FF5B5B]/25 rounded-[20px] p-8 w-full max-w-[480px] shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FF5B5B]/10 border border-[#FF5B5B]/20 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} color="#FF5B5B" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white m-0 tracking-[-0.02em]">
                      Request Role Revocation
                    </h3>
                    <p className="text-xs text-[#666] m-0 mt-1">
                      This request will be reviewed by admin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRevokeModal(false)}
                  className="bg-transparent border-none text-[#555] hover:text-[#888] cursor-pointer p-1 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Warning */}
              <div className="bg-[#FF5B5B]/10 border border-[#FF5B5B]/15 rounded-xl px-4 py-3 mb-5">
                <p className="text-[13px] text-[#FF5B5B] leading-relaxed m-0">
                  ⚠️ <strong>Warning:</strong> Upon admin approval, all your songs will be permanently deleted 
                  and your account will revert to a regular user.
                </p>
              </div>

              {/* Reason textarea */}
              <div className="mb-6">
                <label className="block text-[13px] text-[#888] font-semibold mb-2">
                  Reason for leaving <span className="text-[#FF5B5B]">*</span>
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Please explain why you want to revoke your artist role..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm outline-none resize-y font-sans leading-relaxed box-border focus:border-[#FF5B5B]/50 transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRevokeModal(false)}
                  disabled={isRevoking}
                  className="h-[42px] px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#888] hover:text-[#ccc] text-sm font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeSubmit}
                  disabled={isRevoking || !revokeReason.trim()}
                  className={`flex items-center gap-2 h-[42px] px-5 rounded-xl border-none text-white text-sm font-bold transition-all ${
                    isRevoking || !revokeReason.trim()
                      ? 'bg-[#FF5B5B]/30 cursor-not-allowed'
                      : 'bg-[#FF5B5B]/90 hover:bg-[#FF5B5B] cursor-pointer'
                  }`}
                >
                  {isRevoking ? (
                    <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

