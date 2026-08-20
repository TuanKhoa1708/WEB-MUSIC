import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Disc3, User, Calendar, AlertCircle } from 'lucide-react'
import type { Album, CreateAlbumInput, UpdateAlbumInput } from '@/types/album.types'
import { useArtistOptions } from '@/hooks/artist/useAlbums'
import { uploadFilesApi } from '@/api/song.api' // Reuse the same upload endpoint

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#666',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
        {required && <span style={{ color: '#3FD6FF', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {error && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            color: '#FF5B5B',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={11} />
          {error}
        </span>
      )}
    </div>
  )
}

// ─── Styled input ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  paddingLeft: 14,
  paddingRight: 14,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  outline: 'none',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

function StyledInput({
  icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode
  error?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? '#3FD6FF' : '#444',
            transition: 'color 0.2s',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        style={{
          ...inputStyle,
          paddingLeft: icon ? 38 : 14,
          borderColor: error
            ? 'rgba(255,91,91,0.4)'
            : focused
            ? 'rgba(63,214,255,0.35)'
            : 'rgba(255,255,255,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(63,214,255,0.08)' : 'none',
          ...(props.style || {}),
        }}
      />
    </div>
  )
}

function StyledSelect({
  icon,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: React.ReactNode
  error?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? '#3FD6FF' : '#444',
            transition: 'color 0.2s',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {icon}
        </span>
      )}
      <select
        {...props}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        style={{
          ...inputStyle,
          paddingLeft: icon ? 38 : 14,
          appearance: 'none',
          cursor: 'pointer',
          borderColor: error
            ? 'rgba(255,91,91,0.4)'
            : focused
            ? 'rgba(63,214,255,0.35)'
            : 'rgba(255,255,255,0.08)',
          boxShadow: focused ? '0 0 0 3px rgba(63,214,255,0.08)' : 'none',
        }}
      >
        {children}
      </select>
    </div>
  )
}

// ─── AlbumForm ────────────────────────────────────────────────────────────────

interface AlbumFormProps {
  isOpen: boolean
  onClose: () => void
  album?: Album | null // if set → edit mode
  onSubmit: (data: CreateAlbumInput | UpdateAlbumInput) => Promise<void>
  isLoading?: boolean
}

interface FormValues {
  title: string
  artistId: string
  coverUrl: string
  releaseYear: number | ''
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(vals: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!vals.title.trim()) errors.title = 'Album title is required'
  if (!vals.artistId) errors.artistId = 'Artist is required'
  if (vals.releaseYear && (vals.releaseYear < 1900 || vals.releaseYear > new Date().getFullYear() + 1)) {
    errors.releaseYear = 'Invalid release year'
  }
  return errors
}

export function AlbumForm({ isOpen, onClose, album, onSubmit, isLoading }: AlbumFormProps) {
  const { data: artists = [], isLoading: loadingArtists } = useArtistOptions()

  const isEdit = !!album
  const overlayRef = useRef<HTMLDivElement>(null)

  const emptyForm: FormValues = {
    title: '',
    artistId: '',
    coverUrl: '',
    releaseYear: new Date().getFullYear(),
  }

  const [form, setForm] = useState<FormValues>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('')

  // Reset/prefill form
  useEffect(() => {
    if (isOpen) {
      if (album) {
        const artistId = typeof album.artistId === 'object' ? album.artistId._id : album.artistId || ''
        setForm({
          title: album.title || '',
          artistId,
          coverUrl: album.coverUrl || '',
          releaseYear: album.releaseYear || '',
        })
        setCoverPreviewUrl(album.coverUrl || '')
        setCoverFile(null)
      } else {
        setForm(emptyForm)
        setCoverPreviewUrl('')
        setCoverFile(null)
      }
      setErrors({})
      setSubmitted(false)
      setIsUploading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, album])

  const handleChange = (field: keyof FormValues, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (submitted) {
      const updated = { ...form, [field]: value }
      setErrors(validate(updated))
    }
  }

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const url = URL.createObjectURL(file)
      setCoverPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsUploading(true)
    try {
      let finalCoverUrl = form.coverUrl

      if (coverFile) {
        const formData = new FormData()
        formData.append('cover', coverFile)

        const uploadRes = await uploadFilesApi(formData)
        if (uploadRes.success && uploadRes.data.coverUrl) {
          finalCoverUrl = uploadRes.data.coverUrl
        }
      }

      const payload: CreateAlbumInput = {
        title: form.title.trim(),
        artistId: form.artistId,
        coverUrl: finalCoverUrl || undefined,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      }

      if (isEdit && album) {
        await onSubmit({ ...payload, _id: album._id } as UpdateAlbumInput)
      } else {
        await onSubmit(payload)
      }
    } catch (error) {
      console.error('Submit error', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(63,214,255,0.08)',
                    border: '1px solid rgba(63,214,255,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3FD6FF',
                  }}
                >
                  <Disc3 size={16} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    {isEdit ? 'Edit Album' : 'Create Album'}
                  </h2>
                  <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>
                    {isEdit ? 'Update album information' : 'Add a new album to your catalog'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#555',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#555'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              
              {/* WARNING FOR BACKEND BLOCKER */}
              <div style={{
                background: 'rgba(255,165,0,0.05)',
                border: '1px solid rgba(255,165,0,0.2)',
                borderRadius: 8,
                padding: '12px',
                marginBottom: '20px',
                fontSize: 12,
                color: '#ffb347',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong>Backend Limitation Notice</strong><br/>
                  Because the backend does not link your User account to an Artist ID, you must manually select which Artist this album belongs to.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Title */}
                <Field label="Album Title" required error={errors.title}>
                  <StyledInput
                    id="album-title"
                    icon={<Disc3 size={14} />}
                    placeholder="Enter album title"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={!!errors.title}
                  />
                </Field>

                {/* Artist Selector */}
                <Field label="Artist Profile" required error={errors.artistId}>
                  <StyledSelect
                    id="album-artist"
                    icon={<User size={14} />}
                    value={form.artistId}
                    onChange={(e) => handleChange('artistId', e.target.value)}
                    error={!!errors.artistId}
                    disabled={loadingArtists}
                  >
                    <option value="">
                      {loadingArtists ? 'Loading...' : 'Select your artist profile'}
                    </option>
                    {artists.map((a) => (
                      <option key={a._id} value={a._id} style={{ background: '#1a1a1a' }}>
                        {a.stageName}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>

                {/* Release Year */}
                <Field label="Release Year" error={errors.releaseYear}>
                  <StyledInput
                    id="album-year"
                    type="number"
                    icon={<Calendar size={14} />}
                    placeholder="e.g. 2024"
                    value={form.releaseYear}
                    onChange={(e) => handleChange('releaseYear', e.target.value)}
                    error={!!errors.releaseYear}
                  />
                </Field>

                {/* Cover Upload */}
                <Field label="Album Artwork">
                  <StyledInput
                    id="album-cover-file"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    style={{ paddingTop: 10 }}
                  />
                </Field>

                {/* Cover preview */}
                {coverPreviewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <img
                      src={coverPreviewUrl}
                      alt="Cover preview"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        objectFit: 'cover',
                        background: '#222',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>
                        Artwork preview
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: '#666',
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {coverFile ? coverFile.name : form.coverUrl.split('/').pop()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                  marginTop: 32,
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading || isUploading}
                  style={{
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  style={{
                    height: 40,
                    padding: '0 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#3FD6FF',
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (isLoading || isUploading) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || isUploading) ? 0.7 : 1,
                  }}
                >
                  {isUploading ? 'Uploading...' : isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
