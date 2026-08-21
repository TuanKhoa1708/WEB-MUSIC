interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

function Skeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div
      style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, #151515 25%, #1e1e1e 50%, #151515 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        ...style,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
      <Skeleton height={0} style={{ paddingTop: '100%' }} borderRadius={0} />
      <div style={{ padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton height={12} width="70%" />
        <Skeleton height={10} width="50%" />
      </div>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
      <Skeleton width={36} height={36} borderRadius={6} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Skeleton height={11} width="50%" />
        <Skeleton height={10} width="30%" />
      </div>
      <Skeleton height={10} width={32} />
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
