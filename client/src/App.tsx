import React, { useEffect, useState } from 'react'
import { RootState, RoomState } from './types'
import RoomList from './components/RoomList'

const API_BASE = 'http://localhost:3001/api/rooms'

export default function App() {
  const [state, setState] = useState<RootState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/state`)
      .then(r => r.json())
      .then((data) => setState(data))
      .finally(() => setLoading(false))
  }, [])

  async function patchRoom(id: string, patch: Partial<RoomState>) {
    await fetch(`${API_BASE}/${id}/patch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    })
    setState(prev => {
      if (!prev) return prev
      return { rooms: prev.rooms.map(r => (r.id === id ? { ...r, ...patch } : r)) }
    })
  }

  if (loading) return <div style={{padding:20}}>Loading...</div>
  if (!state) return <div style={{padding:20}}>No state</div>

  return (
    <div className='app-shell'>
      <div className='header'>
        <div className='logo'>SH</div>
        <div>
          <h1>Sergio Home LAN</h1>
          <div className='lead'>Local network control — Bedrooms & Living Room</div>
        </div>
      </div>

      <RoomList rooms={state.rooms} onPatch={patchRoom} />

      <div className='footer-note'>This UI uses a local mock backend. When you integrate your API, update the server code to fetch/persist real device state.</div>
    </div>
  )
}
