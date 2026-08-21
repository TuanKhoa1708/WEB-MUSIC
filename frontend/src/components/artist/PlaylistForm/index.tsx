import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, ListMusic } from 'lucide-react'
import { uploadFilesApi } from '@/api/song.api'
import type { Playlist, CreatePlaylistInput, UpdatePlaylistInput } from '@/types/playlist.types'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface PlaylistFormProps {
  isOpen: boolean
  artistId?: string
  onClose: () => void
  playlist: Playlist | null
  onSubmit: (data: CreatePlaylistInput | UpdatePlaylistInput) => Promise<void>
  isLoading: boolean
}

export function PlaylistForm({ isOpen, artistId, onClose, playlist, onSubmit, isLoading }: PlaylistFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    isPublic: true,
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (playlist) {
        setFormData({
          title: playlist.title,
          description: playlist.description || '',
          coverUrl: playlist.coverUrl || '',
          isPublic: playlist.isPublic ?? true,
        })
      } else {
        setFormData({
          title: '',
          description: '',
          coverUrl: '',
          isPublic: true,
        })
      }
    }
  }, [isOpen, playlist])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('coverFile', file)
      const res = await uploadFilesApi(uploadData)
      if (res.success && res.data.coverUrl) {
        setFormData((prev) => ({ ...prev, coverUrl: res.data.coverUrl! }))
        toast.success('Cover uploaded successfully')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload cover')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (playlist) {
      await onSubmit({
        _id: playlist._id,
        ...formData,
      })
    } else {
      await onSubmit({
        ...formData,
        artistId: artistId || user?.id || '',
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 101,
              background: '#121212',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(247,181,0,0.1)',
                    color: '#F7B500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ListMusic size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                    {playlist ? 'Edit Playlist' : 'Create Playlist'}
                  </h2>
                  <p style={{ fontSize: 13, color: '#888' }}>
                    {playlist ? 'Update playlist details' : 'Add a new playlist to your catalog'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  border: 'none',
                  background: 'transparent',
                  color: '#888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#888'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px', overflowY: 'auto' }}>
              <form id="playlist-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Cover Upload */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                      background: '#1a1a1a',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {formData.coverUrl ? (
                      <img src={formData.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ListMusic size={32} color="#444" />
                    )}
                    
                    {isUploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" color="#3FD6FF" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                      Playlist Cover
                    </label>
                    <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                      Upload a high-quality square image (recommended 500x500).
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      style={{
                        height: 36,
                        padding: '0 16px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Upload size={14} />
                      Choose Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., Summer Vibes 2024"
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

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your playlist..."
                    style={{
                      width: '100%',
                      height: 100,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Visibility */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    style={{ width: 18, height: 18, accentColor: '#3FD6FF', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Public Playlist</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Anyone can find and listen to this playlist.</div>
                  </div>
                </label>

              </form>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '20px 32px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading || isUploading}
                style={{
                  height: 42,
                  padding: '0 20px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#aaa',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="playlist-form"
                disabled={isLoading || isUploading}
                style={{
                  height: 42,
                  padding: '0 24px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #F7B500, #ffc933)',
                  border: 'none',
                  color: '#000',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: (isLoading || isUploading) ? 'wait' : 'pointer',
                  opacity: (isLoading || isUploading) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {playlist ? 'Save Changes' : 'Create Playlist'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
