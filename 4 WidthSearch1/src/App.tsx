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
    <div style={{ minWidth: '100vw', minHeight: '100vh', background: '#f0f2f5', padding: '20px 0' }}>
      <div className="app-container">
      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn${tab === t ? ' active' : ''}`}>{t}</button>
        ))}
      </div>
      {tab === '1. Лабиринт'  && <ShortPathInLabyrin />}
      {tab === '2. Конь'       && <MinKnightMoves />}
      {tab === '3. Апельсины'  && <RottOrang />}
      {tab === '4. Строки'     && <StrinConver />}
      {tab === '5. Ближайший выход' && <MazeSolver />}
      {tab === '6. Поиск слова в сетке' && <WordSearch />}
      </div>
    </div>
  )
}

export default App
