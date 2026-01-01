interface DividerProps {
  label?: string
  position?: 'left' | 'center' | 'right'
  className?: string
}

export function Divider({ label, position = 'center', className = '' }: DividerProps) {
  // If no label, just show a simple line
  if (!label) {
    return <div className={`w-full border-t border-gray-200 ${className}`} />
  }

  const positionStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className={`relative flex ${positionStyles[position]} text-sm`}>
        <span className="px-4 bg-white text-gray-500">{label}</span>
      </div>
    </div>
  )
}
