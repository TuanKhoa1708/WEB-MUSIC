interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '64px 24px',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{ color: '#2a2a2a', marginBottom: 4 }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#444', margin: 0 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 13, color: '#333', margin: 0, maxWidth: 280 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
