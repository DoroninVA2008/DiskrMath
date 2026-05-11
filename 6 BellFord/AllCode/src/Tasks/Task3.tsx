import { useMemo } from 'react'
import { bellmanFord, reconstructPath } from '../BellFord'
import type { Edge } from '../types'

const vertices = ['S', 'A', 'B', 'C', 'F']
const edges: Edge[] = [
  { from: 'S', to: 'A', weight: 2 },
  { from: 'S', to: 'B', weight: 5 },
  { from: 'A', to: 'C', weight: 3 },
  { from: 'B', to: 'C', weight: -2 },
  { from: 'C', to: 'F', weight: 4 },
  { from: 'A', to: 'F', weight: 10 },
]
const positions: Record<string, [number, number]> = {
  S: [50, 100], A: [150, 50], B: [150, 150], C: [280, 100], F: [370, 100],
}

function Task3() {
  const result = useMemo(() => bellmanFord(vertices, edges, 'S'), [])
  const pathToF = reconstructPath(result.predecessors, 'F')
  const distanceToF = result.distances.get('F') ?? Infinity

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Задача 3: Кратчайший путь от S до F</h2>
        <p>Граф: 5 вершин (S, A, B, C, F). Найти кратчайший путь от S до F.</p>
      </div>

      <div className="info-block info-block--gray">
        <h3>Граф</h3>
        <div style={{ background: '#fff', border: '1px solid #d1d9e0', borderRadius: 6, padding: 8 }}>
          <svg viewBox="0 0 420 200" style={{ width: '100%', height: 180 }}>
            {edges.map((edge, idx) => {
              const [x1, y1] = positions[edge.from]
              const [x2, y2] = positions[edge.to]
              return (
                <g key={idx}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={edge.weight < 0 ? '#e53e3e' : '#aab'} strokeWidth="2" />
                  <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8}
                    fill={edge.weight < 0 ? '#e53e3e' : '#555'}
                    fontSize="12" textAnchor="middle">
                    {edge.weight}
                  </text>
                </g>
              )
            })}
            {Object.entries(positions).map(([label, [x, y]]) => (
              <g key={label}>
                <circle cx={x} cy={y} r="18" fill="#1a73e8" />
                <text x={x} y={y + 5} fill="white" textAnchor="middle" fontSize="13" fontWeight="bold">
                  {label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="info-block info-block--green">
        <h3>Найденный путь S → F</h3>
        <p style={{ margin: '0 0 4px' }}><strong>Путь:</strong> {pathToF.join(' → ')}</p>
        <p style={{ margin: '0 0 4px' }}><strong>Длина:</strong> {distanceToF}</p>
        <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}>
          {pathToF.length > 2
            ? `Промежуточные вершины: ${pathToF.slice(1, -1).join(', ')}`
            : 'Прямой путь'}
        </p>
      </div>

      <div className="info-block info-block--gray">
        <h4>Анализ</h4>
        <p style={{ margin: 0, fontSize: '0.92em' }}>
          Благодаря отрицательному ребру B → C (−2), путь через B может оказаться
          короче прямого пути через A. Алгоритм Беллмана-Форда находит оптимальный маршрут.
        </p>
      </div>
    </div>
  )
}

export default Task3
