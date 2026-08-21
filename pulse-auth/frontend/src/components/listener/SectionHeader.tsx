import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  seeAllLink?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, seeAllLink, action }: SectionHeaderProps) {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {action}
        {seeAllLink && (
          <button
            onClick={() => navigate(seeAllLink)}
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              background: 'none', border: 'none',
              color: '#3FD6FF', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', padding: '4px 8px',
              borderRadius: 6, transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(63,214,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            See all <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
