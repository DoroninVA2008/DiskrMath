import { useState, useMemo, useEffect } from 'react'
import { bellmanFord } from '../BellFord'
import type { Edge } from '../types'

const vertices = ['A', 'B', 'C', 'D']
const edges: Edge[] = [
  { from: 'A', to: 'B', weight: 1 },
  { from: 'B', to: 'C', weight: 1 },
  { from: 'C', to: 'D', weight: 1 },
  { from: 'D', to: 'A', weight: -4 },
]
const cycleWeight = 1 + 1 + 1 - 4

function Task8() {
  const [iteration, setIteration] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const result = useMemo(() => bellmanFord(vertices, edges, 'A'), [])

  useEffect(() => {
    if (!isAnimating) return
    const timer = setInterval(() => setIteration(p => p + 1), 1500)
    return () => clearInterval(timer)
  }, [isAnimating])

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Задача 8: Многократные обновления</h2>
        <p>Граф с отрицательным циклом A→B→C→D→A.</p>
      </div>

      <div className="info-block info-block--gray">
        <h3>Граф с отрицательным циклом</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {vertices.map((v, idx) => (
            <div key={v} style={{
              padding: '10px', borderRadius: 24, textAlign: 'center',
              fontWeight: 700, fontSize: '1.1em',
              background: idx === iteration % 4 ? '#e53e3e' : '#e3f2fd',
              color: idx === iteration % 4 ? '#fff' : '#1565c0',
              transition: 'background 0.4s, color 0.4s',
            }}>
              {v}
            </div>
          ))}
        </div>
        <table className="bf-table">
          <thead><tr><th>От</th><th>К</th><th>Вес</th></tr></thead>
          <tbody>
            {edges.map((e, i) => (
              <tr key={i}>
                <td>{e.from}</td>
                <td>{e.to}</td>
                <td className={e.weight < 0 ? 'cell-neg' : ''}>{e.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => { setIsAnimating(!isAnimating); if (!isAnimating) setIteration(0) }}
          style={isAnimating ? { background: '#e53e3e' } : {}}
        >
          {isAnimating ? 'Остановить' : 'Показать бесконечный цикл'}
        </button>

        {iteration > 0 && (
          <div className="info-block info-block--red" style={{ marginTop: 12 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              Итерация {iteration}: Расстояние до D обновлено!
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.9em' }}>
              Каждый проход по циклу A→B→C→D→A уменьшает расстояние на {Math.abs(cycleWeight)}
            </p>
          </div>
        )}
      </div>

      <div className="info-block info-block--orange">
        <h4>Результат проверки</h4>
        <p style={{ margin: '0 0 4px' }}>
          {result.hasNegativeCycle
            ? 'Обнаружен отрицательный цикл: A → B → C → D → A'
            : 'Отрицательный цикл не обнаружен'}
        </p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>
          Вес цикла: 1 + 1 + 1 + (−4) = {cycleWeight}. Расстояния могут уменьшаться бесконечно!
        </p>
      </div>
    </div>
  )
}

export default Task8
