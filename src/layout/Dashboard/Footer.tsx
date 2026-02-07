import { useEffect, useState } from 'react'

function Footer() {
  const year = new Date().getFullYear()
  const [status, setStatus] = useState<'healthy' | 'incident' | 'loading'>('loading')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setStatus('healthy')
        } else {
          setStatus('incident')
        }
      } catch {
        setStatus('incident')
      }
    }

    checkHealth()

  }, [])

  const statusConfig = {
    healthy: { color: 'bg-primary', label: 'Operational' },
    incident: { color: 'bg-red-500', label: 'Incident' },
    loading: { color: 'bg-gray-400', label: 'Checking...' }
  }

  const config = statusConfig[status]

  return (
    <footer className="flex justify-end">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 text-sm text-muted-foreground md:flex-row">
        <p>
          © {year} <span className="font-medium text-foreground">Loric Software</span>. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${config.color}`}></div>
          <span>{config.label}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer