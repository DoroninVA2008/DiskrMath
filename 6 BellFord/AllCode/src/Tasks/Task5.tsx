import { useState, useMemo } from 'react'
import { bellmanFord, reconstructPath } from '../BellFord'
import type { Edge } from '../types'

const vertices = ['A', 'B', 'C', 'D', 'E']
const edges: Edge[] = [
  { from: 'A', to: 'B', weight: 3 },
  { from: 'A', to: 'C', weight: 5 },
  { from: 'B', to: 'D', weight: 1 },
  { from: 'C', to: 'D', weight: 6 },
  { from: 'B', to: 'C', weight: 2 },
  { from: 'D', to: 'E', weight: 4 },
]

function Task5() {
  const [selectedTarget, setSelectedTarget] = useState('D')
  const result = useMemo(() => bellmanFord(vertices, edges, 'A'), [])

  const path = reconstructPath(result.predecessors, selectedTarget)
  const distance = result.distances.get(selectedTarget) ?? Infinity

  const calcWeight = (p: string[]) =>
    p.slice(0, -1).reduce((sum, v, i) => {
      const e = edges.find(e => e.from === v && e.to === p[i + 1])
      return sum + (e?.weight ?? 0)
    }, 0)

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Задача 5: Восстановление пути</h2>
        <p>Выбери конечную вершину и посмотри кратчайший путь от A.</p>
      </div>

      <div className="info-block info-block--gray">
        <h4>Показать путь от A до:</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {vertices.filter(v => v !== 'A').map(v => (
            <button
              key={v}
              onClick={() => setSelectedTarget(v)}
              style={v !== selectedTarget ? { background: '#e2e8f0', color: '#334155' } : {}}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="info-block info-block--blue">
        <h3>Кратчайший путь A → {selectedTarget}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {path.map((v, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: '#1a73e8', color: '#fff', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700,
              }}>
                {v}
              </span>
              {i < path.length - 1 && (
                <>
                  <span style={{ color: '#64748b' }}>→</span>
                  <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: 4, fontSize: '0.85em' }}>
                    {edges.find(e => e.from === path[i] && e.to === path[i + 1])?.weight}
                  </span>
                  <span style={{ color: '#64748b' }}>→</span>
                </>
              )}
            </span>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: '1.05em' }}>
          <strong>Итого:</strong> {distance} единиц
        </p>
      </div>

      <div className="info-block info-block--gray">
        <h4>Детали маршрута</h4>
        {path.slice(0, -1).map((v, i) => {
          const next = path[i + 1]
          const w = edges.find(e => e.from === v && e.to === next)?.weight
          return (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.9em', marginBottom: 4 }}>
              {v} → {next}: {w}
            </div>
          )
        })}
        <div style={{ borderTop: '1px solid #d1d9e0', paddingTop: 8, marginTop: 8, fontWeight: 600 }}>
          Общая длина: {calcWeight(path)} = {distance}
        </div>
      </div>

      <div className="info-block info-block--yellow">
        <h4>Информация</h4>
        <p style={{ margin: 0, fontSize: '0.92em' }}>
          Путь A → B → D имеет длину 3 + 1 = 4, что короче альтернативного
          пути A → C → D с длиной 5 + 6 = 11. Алгоритм Беллмана-Форда
          автоматически находит оптимальный маршрут!
        </p>
      </div>
    </div>
  )
}

export default Task5
