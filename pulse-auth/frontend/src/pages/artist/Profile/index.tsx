import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCircle2, Save, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateMeService } from '@/services/user.service'
import { uploadFilesApi } from '@/api/song.api' // Reuse upload endpoint for images
import toast from 'react-hot-toast'

export function ArtistProfilePage() {
  const { user } = useAuth() // login updates AuthContext state
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      {/* ── Page header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(63,214,255,0.08)',
              border: '1px solid rgba(63,214,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3FD6FF',
              flexShrink: 0,
            }}
          >
            <UserCircle2 size={28} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              My Profile
            </h1>
            <p style={{ fontSize: 15, color: '#888', marginTop: 4 }}>
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
        style={{
          background: '#121212',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: 32,
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                background: 'rgba(255,255,255,0.05)',
                border: '2px dashed rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle2 size={40} color="#555" />
              )}

              {isUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={24} className="animate-spin" color="#3FD6FF" />
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: 'rgba(63,214,255,0.1)',
                  color: '#3FD6FF',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Upload size={16} />
                Upload New Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
              </label>
              <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                Recommended: Square image, at least 400x400px.
              </p>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 12,
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 12,
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>
              Email Address (Read-only)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                height: 44,
                padding: '0 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                color: '#666',
                fontSize: 14,
                outline: 'none',
                cursor: 'not-allowed',
              }}
            />
            <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
              Email changes must be requested through support.
            </p>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 44,
                padding: '0 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
                border: 'none',
                color: '#000',
                fontSize: 14,
                fontWeight: 700,
                cursor: (isSaving || isUploading) ? 'wait' : 'pointer',
                opacity: (isSaving || isUploading) ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(63,214,255,0.3)',
              }}
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
    </div>
  )
}
