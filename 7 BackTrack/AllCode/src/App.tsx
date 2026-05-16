import { useState } from 'react'
import PermutationsGenerator from './Tasks/1 RearraNumbers'
import { SubsetsVisualDemo } from './Tasks/2 Subsets'
import { LabirynthWay } from './Tasks/3 LabirynthWay'
import './index.css'

const TABS = [
  { id: 1, label: 'Задача 1: Пример. Перестановки чисел', component: PermutationsGenerator },
  { id: 2, label: 'Задача 2: Подмножества', component: SubsetsVisualDemo },
  { id: 3, label: 'Задача 3: Путь в лабиринте', component: LabirynthWay },
]

function App() {
  const [activeId, setActiveId] = useState(1)
  const ActiveComponent = TABS.find(t => t.id === activeId)!.component

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`tab-btn${t.id === activeId ? ' active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <ActiveComponent />
    </div>
  )
}

export default App