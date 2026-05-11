import { useMemo } from 'react'
import { bellmanFord, reconstructPath } from '../BellFord'
import type { Edge } from '../types'

const vertices = ['A', 'B', 'C', 'D', 'E']
const edges: Edge[] = [
  { from: 'A', to: 'B', weight: 4 },
  { from: 'A', to: 'C', weight: 2 },
  { from: 'B', to: 'C', weight: -1 },
  { from: 'B', to: 'D', weight: 5 },
  { from: 'C', to: 'D', weight: 8 },
  { from: 'C', to: 'E', weight: 10 },
  { from: 'D', to: 'E', weight: 2 },
]
const START = 'A'

function Task1() {
  const result = useMemo(() => bellmanFord(vertices, edges, START), [])

  const getPath = (target: string) =>
    reconstructPath(result.predecessors, target).join(' → ')

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Задача 1: Базовый пример с отрицательным весом</h2>
        <p>Граф: 5 вершин (A–E), 7 рёбер. Старт: вершина A.</p>
      </div>

      <div className="info-block info-block--gray">
        <h3>Исходные данные (рёбра)</h3>
        <table className="bf-table">
          <thead>
            <tr>
              <th>От</th><th>К</th><th>Вес</th>
            </tr>
          </thead>
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

      <div className="info-block info-block--green">
        <h3>Кратчайшие пути от вершины {START}</h3>
        {vertices.map(v => {
          const dist = result.distances.get(v)
          const path = v !== START ? getPath(v) : ''
          return (
            <div key={v} style={{ marginBottom: 6 }}>
              <strong>{v}:</strong> {dist === Infinity ? '∞' : dist}
              {v !== START && dist !== Infinity && (
                <span style={{ color: '#555', fontSize: '0.9em' }}> — {path}</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="info-block info-block--blue">
        <h4>Как работает алгоритм</h4>
        <p style={{ margin: 0, fontSize: '0.92em' }}>
          Алгоритм Беллмана-Форда выполняет релаксацию всех рёбер V−1 раз (здесь 4 итерации).
          Обратите внимание: путь A → B → C (4 + (−1) = 3) короче прямого A → C (2).
        </p>
      </div>
    </div>
  )
}

export default Task1
