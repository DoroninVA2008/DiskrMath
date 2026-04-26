import { useState } from 'react'
import ShortPathInLabyrin from './1 ShortPathInLabyrin/1 ShortPathInLabyrin'
import MinKnightMoves from './2 MinIghtMoves/2 MinIghtMoves'
import RottOrang from './3 RottOrang/3 RottOrang'
import StrinConver from './4 StrinConver/4 StrinConver'
import MazeSolver from './5 NearExitFromLabyrin/5 NearExitFromLabyrin'
import WordSearch from './6 SearchWordInGrid/6 SearchWordInGrid'

const TABS = ['1. Лабиринт', '2. Конь', '3. Апельсины', '4. Строки', '5. Ближайший выход', '6. Поиск слова в сетке'] as const
type Tab = typeof TABS[number]

function App() {
  const [tab, setTab] = useState<Tab>('1. Лабиринт')
  return (
    <div style={{ background: '#0f172a', minWidth: '100vw', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: 4, padding: '10px 20px', borderBottom: '1px solid #1e293b', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14,
            background: tab === t ? '#334155' : 'transparent',
            color:      tab === t ? '#e2e8f0' : '#64748b',
            border:     tab === t ? '1px solid #475569' : '1px solid transparent',
          }}>{t}</button>
        ))}
      </div>
      {tab === '1. Лабиринт'  && <ShortPathInLabyrin />}
      {tab === '2. Конь'       && <MinKnightMoves />}
      {tab === '3. Апельсины'  && <RottOrang />}
      {tab === '4. Строки'     && <StrinConver />}
      {tab === '5. Ближайший выход' && <MazeSolver />}
      {tab === '6. Поиск слова в сетке' && <WordSearch />}
    </div>
  )
}

export default App
