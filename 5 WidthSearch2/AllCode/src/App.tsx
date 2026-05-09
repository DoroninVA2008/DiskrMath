import { useState } from 'react'
import IslandsCounter from './1 IslandsCounter/1 IslandsCounter'
import ShortestBridge from './2 ShortestBridge/2 ShortestBridge'
import RotatingLocks from './3 RotatingLocks/3 RotatingLocks'
import RoomEvacuation from './4 RoomEvacuation/4 RoomEvacuation'
import SnowBall from './5 SnowBall/5 SnowBall'

const tabs = ['1. Острова', '2. Мост', '3. Замки', '4. Комнаты', '5. Ком'] as const
type Tab = typeof tabs[number]

function App() {
  const [tab, setTab] = useState<Tab>('1. Острова')
  return (
    <div style={{ minWidth: '100vw', minHeight: '100vh', background: '#f0f2f5', padding: '20px 0' }}>
      <div className="app-container">
      <div className="tab-nav">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn${tab === t ? ' active' : ''}`}>{t}</button>
        ))}
      </div>
      {tab === '1. Острова' && <IslandsCounter />}
      {tab === '2. Мост' && <ShortestBridge />}
      {tab === '3. Замки' && <RotatingLocks />}
      {tab === '4. Комнаты' && <RoomEvacuation />}
      {tab === '5. Ком' && <SnowBall />}
      </div>
    </div>
  )
}

export default App
