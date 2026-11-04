
import { useEffect, useState } from 'react'
import api from './services/api'

function App() {
  const [status, setStatus] = useState('Connecting...')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/health')
      .then((response) => {
        setStatus(response.data.message)
      })
      .catch(() => {
        setStatus('Backend connection failed')
        setError('Please check whether the Express server is running.')
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          PLATIFY
        </h1>

        <p className="mt-4 text-lg text-slate-400">
          Retail Commerce & Store Management Platform
        </p>

        <div className="mt-8 rounded-xl bg-indigo-600 px-6 py-4 text-white">
          <p className="font-semibold">Frontend Setup Complete</p>
          <p className="mt-2 text-sm">{status}</p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}

export default App
