import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, User, FileText, Image, Link } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Artist, CreateArtistInput, UpdateArtistInput } from '@/types/artist.types'

const schema = z.object({
  stageName: z.string().min(1, 'Stage name is required').max(100),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  coverImage: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
})

type FormData = z.infer<typeof schema>

interface ArtistModalProps {
  isOpen: boolean
  onClose: () => void
  artist?: Artist | null
  onSubmit: (data: CreateArtistInput | UpdateArtistInput) => Promise<void>
  isLoading?: boolean
}

export function ArtistModal({ isOpen, onClose, artist, onSubmit, isLoading }: ArtistModalProps) {
  const isEditing = !!artist

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      stageName: '', 
      bio: '', 
      avatarUrl: '', 
      coverImage: '',
      socialLinks: { facebook: '', instagram: '', youtube: '' }
    },
  })

  const watchedName = watch('stageName')

  useEffect(() => {
    if (isOpen) {
      reset(artist
        ? { 
            stageName: artist.stageName, 
            bio: artist.bio || '', 
            avatarUrl: artist.avatarUrl || '',
            coverImage: artist.coverImage || '',
            socialLinks: {
              facebook: artist.socialLinks?.facebook || '',
              instagram: artist.socialLinks?.instagram || '',
              youtube: artist.socialLinks?.youtube || '',
            }
          }
        : { 
            stageName: '', 
            bio: '', 
            avatarUrl: '', 
            coverImage: '',
            socialLinks: { facebook: '', instagram: '', youtube: '' }
          }
      )
    }
  }, [isOpen, artist, reset])

  const onFormSubmit = async (data: FormData) => {
    if (isEditing && artist) {
      await onSubmit({ _id: artist._id, ...data })
    } else {
      await onSubmit(data as CreateArtistInput)
    }
    onClose()
  }

  // Avatar initials preview
  const initials = watchedName
    ? watchedName.split(' ').map(w => w.charAt(0)).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 320 } }}
            exit={{ opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.18 } }}
            style={{
              position: 'relative',
              width: '100%', maxWidth: 520,
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Top accent line */}
            <div style={{
              height: 2,
              background: 'linear-gradient(90deg, #3FD6FF, #2094ff, #A78BFA)',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 0',
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                  {isEditing ? 'Edit Artist Profile' : 'Add New Artist'}
                </h2>
                <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                  {isEditing ? `Editing ${artist?.stageName}` : 'Fill in the artist details below'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#555', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#555'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '65vh' }}>
              <form id="artist-form" onSubmit={handleSubmit(onFormSubmit)}>

                {/* Avatar Preview */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px', marginBottom: 24,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 14,
                }}>
                  {/* Avatar circle */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(63,214,255,0.15), rgba(167,139,250,0.15))',
                    border: '1px solid rgba(63,214,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#3FD6FF', letterSpacing: '-0.02em' }}>
                      {initials}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>
                      {watchedName || 'Artist Name'}
                    </p>
                    <p style={{ fontSize: 11, color: '#444', margin: '0' }}>
                      Avatar preview
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Stage Name */}
                  <FieldWrapper label="Stage Name" icon={<User size={13} />} error={errors.stageName?.message}>
                    <input
                      {...register('stageName')}
                      type="text"
                      placeholder="e.g. Luna Eclipse"
                      style={inputStyle(!!errors.stageName)}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(63,214,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(63,214,255,0.08)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.stageName ? 'rgba(255,91,91,0.5)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </FieldWrapper>

                  {/* Bio */}
                  <FieldWrapper label="Bio" icon={<FileText size={13} />} error={errors.bio?.message}>
                    <textarea
                      {...register('bio')}
                      placeholder="Artist biography..."
                      rows={3}
                      style={{ ...inputStyle(!!errors.bio), height: 'auto', paddingTop: 10, resize: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(63,214,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(63,214,255,0.08)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.bio ? 'rgba(255,91,91,0.5)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </FieldWrapper>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Avatar URL */}
                    <FieldWrapper label="Avatar URL" icon={<Image size={13} />} error={errors.avatarUrl?.message}>
                      <input
                        {...register('avatarUrl')}
                        type="url"
                        placeholder="https://..."
                        style={inputStyle(!!errors.avatarUrl)}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(63,214,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(63,214,255,0.08)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = errors.avatarUrl ? 'rgba(255,91,91,0.5)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </FieldWrapper>

                    {/* Cover Image */}
                    <FieldWrapper label="Cover Image URL" icon={<Image size={13} />} error={errors.coverImage?.message}>
                      <input
                        {...register('coverImage')}
                        type="url"
                        placeholder="https://..."
                        style={inputStyle(!!errors.coverImage)}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(63,214,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(63,214,255,0.08)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = errors.coverImage ? 'rgba(255,91,91,0.5)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </FieldWrapper>
                  </div>

                  {/* Social Links */}
                  <div style={{ marginTop: 8 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Link size={14} color="#888" />
                      Social Links
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <input
                        {...register('socialLinks.facebook')}
                        type="url"
                        placeholder="Facebook URL"
                        style={inputStyle(!!errors.socialLinks?.facebook)}
                      />
                      <input
                        {...register('socialLinks.instagram')}
                        type="url"
                        placeholder="Instagram URL"
                        style={inputStyle(!!errors.socialLinks?.instagram)}
                      />
                      <input
                        {...register('socialLinks.youtube')}
                        type="url"
                        placeholder="Youtube URL"
                        style={inputStyle(!!errors.socialLinks?.youtube)}
                      />
                    </div>
                  </div>

                </div>
              </form>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
              padding: '16px 24px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <button
                type="button" onClick={onClose} disabled={isLoading}
                style={{
                  height: 38, paddingInline: 18,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#888', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
              >
                Cancel
              </button>
              <button
                type="submit" form="artist-form" disabled={isLoading}
                style={{
                  height: 38, paddingInline: 20,
                  borderRadius: 10, border: 'none',
                  background: isLoading ? 'rgba(63,214,255,0.5)' : 'linear-gradient(135deg, #3FD6FF, #2094ff)',
                  color: '#000', fontSize: 13, fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: isLoading ? 'none' : '0 4px 16px rgba(63,214,255,0.3)',
                  transition: 'all 0.15s',
                  letterSpacing: '-0.01em',
                }}
              >
                {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                {isEditing ? 'Save Changes' : 'Create Artist'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FieldWrapper({
  label, icon, error, children,
}: {
  label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: '#888',
        letterSpacing: '0.02em', textTransform: 'uppercase',
      }}>
        {icon && <span style={{ color: '#444' }}>{icon}</span>}
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 11, color: '#FF5B5B', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%', height: 42,
    paddingInline: 14,
    borderRadius: 10,
    border: `1px solid ${hasError ? 'rgba(255,91,91,0.5)' : 'rgba(255,255,255,0.07)'}`,
    background: 'rgba(255,255,255,0.03)',
    color: '#fff', fontSize: 13,
    outline: 'none',
    transition: 'all 0.15s',
    boxSizing: 'border-box',
  }
}
