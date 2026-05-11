import { useMemo } from 'react'
import { bellmanFord, reconstructPath } from '../BellFord'
import type { Edge } from '../types'

const vertices = ['S', 'A', 'B', 'C']
const edges: Edge[] = [
  { from: 'S', to: 'A', weight: 3 },
  { from: 'S', to: 'B', weight: 4 },
  { from: 'A', to: 'B', weight: -2 },
  { from: 'B', to: 'C', weight: 1 },
  { from: 'A', to: 'C', weight: 5 },
]

function edgeClass(weight: number) {
  if (weight < 0) return 'info-block--red'
  if (weight > 3) return 'info-block--yellow'
  return 'info-block--green'
}

function Task9() {
  const result = useMemo(() => bellmanFord(vertices, edges, 'S'), [])

  const getPath = (target: string) =>
    reconstructPath(result.predecessors, target).join(' → ')

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Задача 9: Два отрицательных ребра</h2>
        <p>Граф: 4 вершины (S, A, B, C). Старт: вершина S.</p>
      </div>

      <div className="info-block info-block--gray">
        <h3>Граф (рёбра)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {edges.map((e, i) => (
            <div key={i} className={`info-block ${edgeClass(e.weight)}`} style={{ marginBottom: 0 }}>
              <strong>{e.from}</strong> → <strong>{e.to}</strong>
              <span style={{ marginLeft: 8, fontSize: '0.9em' }}>
                (вес: <strong>{e.weight}</strong>)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-block info-block--blue">
        <h3>Кратчайшие пути от S</h3>
        {vertices.map(v => {
          const dist = result.distances.get(v)
          const isStart = v === 'S'
          return (
            <div key={v} style={{
              padding: '8px 12px', marginBottom: 8, borderRadius: 6,
              background: isStart ? '#e3f2fd' : '#f5f5f5',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <strong>{v}</strong>
                {!isStart && dist !== Infinity && (
                  <span style={{ marginLeft: 8, fontSize: '0.88em', color: '#555' }}>
                    Путь: {getPath(v)}
                  </span>
                )}
              </div>
              <strong>{dist === Infinity ? '∞' : dist}</strong>
            </div>
          )
        })}
      </div>

      <div className="info-block info-block--indigo">
        <h4>Интересное наблюдение</h4>
        <p style={{ margin: 0, fontSize: '0.92em' }}>
          Несмотря на то, что прямое ребро S → B имеет вес 4,
          путь через A (S → A → B = 3 + (−2) = 1) оказывается короче
          благодаря отрицательному ребру A → B.
        </p>
      </div>
    </div>
  )
}

export default Task9
