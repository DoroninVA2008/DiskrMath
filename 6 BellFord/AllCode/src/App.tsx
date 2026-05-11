import { useState } from 'react'
import Task1 from './Tasks/Task1'
import Task3 from './Tasks/Task3'
import Task5 from './Tasks/Task5'
import Task8 from './Tasks/Task8'
import Task9 from './Tasks/Task9'
import './index.css'

const TABS = [
  { id: 1, label: 'Задача 1: Базовый пример',       component: Task1 },
  { id: 3, label: 'Задача 3: Путь S → F',           component: Task3 },
  { id: 5, label: 'Задача 5: Восстановление пути',  component: Task5 },
  { id: 8, label: 'Задача 8: Отрицательный цикл',   component: Task8 },
  { id: 9, label: 'Задача 9: Два отриц. ребра',     component: Task9 },
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
