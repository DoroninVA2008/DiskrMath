import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

type Edge = {
  from: string
  to: string
  weight: number
}

const EDGES: Edge[] = [
  { from: 'A', to: 'B', weight: 13 },
  { from: 'A', to: 'C', weight: 3 },
  { from: 'A', to: 'D', weight: 9 },
  { from: 'A', to: 'E', weight: 9 },
  { from: 'B', to: 'C', weight: 11 },
  { from: 'B', to: 'D', weight: 11 },
  { from: 'B', to: 'E', weight: 13 },
  { from: 'C', to: 'D', weight: 9 },
  { from: 'C', to: 'E', weight: 7 },
  { from: 'D', to: 'E', weight: 2 },
]

function buildMST(edges: Edge[]): Edge[] {
  const nodes = [...new Set(edges.flatMap(e => [e.from, e.to]))]
  const visited = new Set<string>([nodes[0]])
  const mst: Edge[] = []

  while (visited.size < nodes.length) {
    let best: Edge | null = null

    for (const edge of edges) {
      const fromIn = visited.has(edge.from)
      const toIn = visited.has(edge.to)
      if (fromIn !== toIn) {
        if (!best || edge.weight < best.weight) best = edge
      }
    }

    if (best === null) break
    mst.push(best)
    visited.add(best.from)
    visited.add(best.to)
  }

  return mst
}

function Task2() {
  const [mst, setMST] = useState<Edge[]>([])

  function handleBuild() {
    setMST(buildMST(EDGES))
  }

  const totalWeight = mst.reduce((sum, e) => sum + e.weight, 0)

  return (
    <div className="app-container">
      <h1>Упражнение 2</h1>
      <p>Пример 7.9. Найдите минимальное остовное дерево.</p>
      <button onClick={handleBuild}>Вычислить</button>

      {mst.length > 0 && (
        <>
          <h3>Минимальное остовное дерево:</h3>
          <ul>
            {mst.map((e, i) => (
              <li key={i}>
                {e.from} — {e.to} : {e.weight}
              </li>
            ))}
          </ul>
          <p><strong>Общий вес: {totalWeight}</strong></p>
        </>
      )}

      <Link to="/1sTask">
        <button>Предыдущий алгоритм</button>
      </Link>
      <Link to="/3rTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  )
}

export default Task2
