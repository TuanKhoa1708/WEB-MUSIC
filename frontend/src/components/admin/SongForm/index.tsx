import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Music,
  User,
  Disc3,
  Clock,
  Tag,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlertCircle,
  Check,
} from 'lucide-react'
import type { Song, CreateSongInput, UpdateSongInput } from '@/types/song.types'
import { useArtistOptions, useAlbumOptions } from '@/hooks/admin/useSongs'
import { uploadFilesApi } from '@/api/song.api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function parseDurationInput(val: string): number {
  // Accept "3:45" or plain seconds "225"
  if (val.includes(':')) {
    const [m, s] = val.split(':').map(Number)
    return (m || 0) * 60 + (s || 0)
  }
  return Number(val) || 0
}

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
        {required && (
          <span style={{ color: '#3FD6FF', marginLeft: 4 }}>*</span>
        )}
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

function StyledTextarea({
  icon,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
            top: 12,
            color: focused ? '#3FD6FF' : '#444',
            transition: 'color 0.2s',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
      )}
      <textarea
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
          width: '100%',
          minHeight: 90,
          paddingLeft: icon ? 38 : 14,
          paddingRight: 14,
          paddingTop: 11,
          paddingBottom: 11,
          borderRadius: 10,
          border: `1px solid ${
            error
              ? 'rgba(255,91,91,0.4)'
              : focused
              ? 'rgba(63,214,255,0.35)'
              : 'rgba(255,255,255,0.08)'
          }`,
          background: 'rgba(255,255,255,0.03)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          outline: 'none',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          resize: 'vertical',
          boxSizing: 'border-box',
          boxShadow: focused ? '0 0 0 3px rgba(63,214,255,0.08)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...((props.style as React.CSSProperties) || {}),
        }}
      />
    </div>
  )
}

// ─── KNOWN GENRES (based on common music genres) ──────────────────────────────

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Classical',
  'Electronic', 'Dance', 'Country', 'Folk', 'Indie', 'Metal',
  'Punk', 'Reggae', 'Soul', 'Blues', 'Latin', 'K-Pop', 'V-Pop',
]

// ─── SongForm ─────────────────────────────────────────────────────────────────

interface SongFormProps {
  isOpen: boolean
  onClose: () => void
  song?: Song | null        // if set → edit mode
  onSubmit: (data: CreateSongInput | UpdateSongInput) => Promise<void>
  isLoading?: boolean
}

interface FormValues {
  title: string
  artistId: string
  albumId: string
  audioUrl: string
  coverUrl: string
  genre: string
  description: string
  duration: number
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(vals: FormValues, isEdit: boolean, audioFile: File | null): FormErrors {
  const errors: FormErrors = {}
  if (!vals.title.trim()) errors.title = 'Song title is required'
  if (!vals.artistId) errors.artistId = 'Artist is required'
  if (!isEdit && !audioFile) errors.audioUrl = 'Audio file is required'
  return errors
}

export function SongForm({ isOpen, onClose, song, onSubmit, isLoading }: SongFormProps) {
  const { data: artists = [], isLoading: loadingArtists } = useArtistOptions()
  const { data: albums = [], isLoading: loadingAlbums } = useAlbumOptions()

  const isEdit = !!song
  const overlayRef = useRef<HTMLDivElement>(null)

  const emptyForm: FormValues = {
    title: '',
    artistId: '',
    albumId: '',
    audioUrl: '',
    coverUrl: '',
    genre: '',
    description: '',
    duration: 0,
  }

  const [form, setForm] = useState<FormValues>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('')
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('')

  // Reset/prefill form when song or open state changes
  useEffect(() => {
    if (isOpen) {
      if (song) {
        const artistId =
          typeof song.artistId === 'object' ? song.artistId._id : song.artistId || ''
        const albumId =
          song.albumId
            ? typeof song.albumId === 'object'
              ? song.albumId._id
              : song.albumId
            : ''
        setForm({
          title: song.title || '',
          artistId,
          albumId: albumId || '',
          audioUrl: song.audioUrl || '',
          coverUrl: song.coverUrl || '',
          genre: song.genre || '',
          description: song.description || '',
          duration: song.duration || 0,
        })
        setAudioPreviewUrl(song.audioUrl || '')
        setCoverPreviewUrl(song.coverUrl || '')
        setAudioFile(null)
        setCoverFile(null)
      } else {
        setForm(emptyForm)
        setAudioPreviewUrl('')
        setCoverPreviewUrl('')
        setAudioFile(null)
        setCoverFile(null)
      }
      setErrors({})
      setSubmitted(false)
      setIsUploading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, song])

  // Auto-fetch duration when audio file or url changes
  useEffect(() => {
    if (!audioPreviewUrl) return
    
    // Skip if editing and URL hasn't changed to avoid overriding
    if (isEdit && song && song.audioUrl === audioPreviewUrl && song.duration > 0 && !audioFile) {
      return
    }

    try {
      const audio = new Audio(audioPreviewUrl)
      
      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
          setForm(prev => ({ ...prev, duration: Math.round(audio.duration) }))
        }
      }
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeAttribute('src')
      }
    } catch (err) {
      // Ignore audio load errors
    }
  }, [audioPreviewUrl, isEdit, song, audioFile])

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (submitted) {
      const updated = { ...form, [field]: value }
      setErrors(validate(updated, isEdit, audioFile))
    }
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioPreviewUrl(url)
      if (submitted) {
        setErrors(validate(form, isEdit, file))
      }
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
    const errs = validate(form, isEdit, audioFile)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsUploading(true)
    try {
      let finalAudioUrl = form.audioUrl
      let finalCoverUrl = form.coverUrl

      if (audioFile || coverFile) {
        const formData = new FormData()
        if (audioFile) formData.append('audio', audioFile)
        if (coverFile) formData.append('cover', coverFile)

        const uploadRes = await uploadFilesApi(formData)
        if (uploadRes.success) {
          if (uploadRes.data.audioUrl) finalAudioUrl = uploadRes.data.audioUrl
          if (uploadRes.data.coverUrl) finalCoverUrl = uploadRes.data.coverUrl
        }
      }

      const payload: CreateSongInput = {
        title: form.title.trim(),
        artistId: form.artistId,
        albumId: form.albumId || null,
        audioUrl: finalAudioUrl,
        coverUrl: finalCoverUrl || undefined,
        duration: form.duration,
        genre: form.genre || undefined,
        description: form.description.trim() || undefined,
      }

      if (isEdit && song) {
        await onSubmit({ ...payload, _id: song._id } as UpdateSongInput)
      } else {
        await onSubmit(payload)
      }
    } catch (error) {
      console.error('Submit error', error)
    } finally {
      setIsUploading(false)
    }
  }

  // Close on overlay click
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
              maxWidth: 580,
              maxHeight: 'calc(100vh - 48px)',
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
                  <Music size={16} />
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
                    {isEdit ? 'Edit Song' : 'Add New Song'}
                  </h2>
                  <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>
                    {isEdit ? 'Update song information' : 'Add a song to the Pulse library'}
                  </p>
                </div>
              </div>
              <button
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
            <form
              onSubmit={handleSubmit}
              style={{ flex: 1, overflowY: 'auto', padding: '24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Title */}
                <Field label="Song Title" required error={errors.title}>
                  <StyledInput
                    id="song-title"
                    icon={<Music size={14} />}
                    placeholder="Enter song title"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={!!errors.title}
                  />
                </Field>

                {/* Artist + Album row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Artist" required error={errors.artistId}>
                    <StyledSelect
                      id="song-artist"
                      icon={<User size={14} />}
                      value={form.artistId}
                      onChange={(e) => handleChange('artistId', e.target.value)}
                      error={!!errors.artistId}
                      disabled={loadingArtists}
                    >
                      <option value="">
                        {loadingArtists ? 'Loading...' : 'Select artist'}
                      </option>
                      {artists.map((a) => (
                        <option key={a._id} value={a._id} style={{ background: '#1a1a1a' }}>
                          {a.stageName}
                        </option>
                      ))}
                    </StyledSelect>
                  </Field>

                  <Field label="Album" error={errors.albumId}>
                    <StyledSelect
                      id="song-album"
                      icon={<Disc3 size={14} />}
                      value={form.albumId}
                      onChange={(e) => handleChange('albumId', e.target.value)}
                      disabled={loadingAlbums}
                    >
                      <option value="">
                        {loadingAlbums ? 'Loading...' : 'No album (single)'}
                      </option>
                      {albums.map((al) => (
                        <option key={al._id} value={al._id} style={{ background: '#1a1a1a' }}>
                          {al.title}
                        </option>
                      ))}
                    </StyledSelect>
                  </Field>
                </div>

                {/* Audio Upload */}
                <Field label="Audio File" required error={errors.audioUrl}>
                  <StyledInput
                    id="song-audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    error={!!errors.audioUrl}
                    style={{ paddingTop: 10 }}
                  />
                </Field>

                {/* Audio preview */}
                {audioPreviewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      marginTop: -4
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>Audio preview</p>
                      {form.duration > 0 && (
                         <span style={{ fontSize: 11, color: '#3FD6FF', fontWeight: 600 }}>
                           {Math.floor(form.duration / 60)}:{(form.duration % 60).toString().padStart(2, '0')}
                         </span>
                      )}
                    </div>
                    <audio
                      controls
                      key={audioPreviewUrl}
                      style={{
                        width: '100%',
                        height: 36,
                        borderRadius: 8,
                        outline: 'none',
                        filter: 'invert(1) hue-rotate(180deg)',
                        opacity: 0.8,
                      }}
                    >
                      <source src={audioPreviewUrl} />
                      Your browser does not support audio playback.
                    </audio>
                  </motion.div>
                )}

                {/* Cover Upload */}
                <Field label="Cover Image">
                  <StyledInput
                    id="song-cover-file"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    style={{ paddingTop: 10 }}
                  />
                </Field>

                {/* Genre row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  <Field label="Genre">
                    <StyledSelect
                      id="song-genre"
                      icon={<Tag size={14} />}
                      value={form.genre}
                      onChange={(e) => handleChange('genre', e.target.value)}
                    >
                      <option value="">Select genre</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g} style={{ background: '#1a1a1a' }}>
                          {g}
                        </option>
                      ))}
                    </StyledSelect>
                  </Field>
                </div>

                {/* Description */}
                <Field label="Description">
                  <StyledTextarea
                    id="song-description"
                    icon={<AlignLeft size={14} />}
                    placeholder="Enter song description here (optional)"
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
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
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: 'cover',
                        background: '#222',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>
                        Cover preview
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: '#444',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {coverFile ? coverFile.name : form.coverUrl}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  disabled={isLoading}
                  style={{
                    height: 40,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent',
                    color: '#888',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: isUploading || isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isUploading || isLoading ? 1 : 0.97 }}
                  disabled={isUploading || isLoading}
                  id={isEdit ? 'btn-update-song' : 'btn-create-song'}
                  style={{
                    height: 40,
                    paddingLeft: 22,
                    paddingRight: 22,
                    borderRadius: 10,
                    border: 'none',
                    background: (isUploading || isLoading) ? '#555' : 'linear-gradient(135deg, #3FD6FF, #2094ff)',
                    color: (isUploading || isLoading) ? '#ccc' : '#000',
                    fontSize: 13,
                    fontWeight: 700,
                    gap: 8,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    boxShadow: (isUploading || isLoading) ? 'none' : '0 4px 16px rgba(63,214,255,0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          border: '2px solid rgba(0,0,0,0.3)',
                          borderTopColor: '#000',
                          animation: 'spin 0.7s linear infinite',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      {isEdit ? 'Save Changes' : 'Create Song'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
