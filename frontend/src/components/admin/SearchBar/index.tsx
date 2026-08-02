import { useRef } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
    >
      <Search
        size={14}
        style={{
          position: 'absolute',
          left: 12,
          color: '#444',
          pointerEvents: 'none',
        }}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 38,
          paddingLeft: 36,
          paddingRight: value ? 36 : 14,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.04)',
          color: '#fff',
          fontSize: 13,
          outline: 'none',
          width: 240,
          transition: 'border-color 0.2s, box-shadow 0.2s, width 0.2s',
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = 'rgba(63,214,255,0.35)'
          ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(63,214,255,0.07)'
          ;(e.target as HTMLInputElement).style.width = '280px'
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.07)'
          ;(e.target as HTMLInputElement).style.boxShadow = 'none'
          ;(e.target as HTMLInputElement).style.width = '240px'
        }}
      />
      {value && (
        <button
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          style={{
            position: 'absolute',
            right: 10,
            background: 'none',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#aaa')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#555')}
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
