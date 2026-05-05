import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

const EDGES = [
  { from: 'A', to: 'B', weight: 5 },
  { from: 'A', to: 'C', weight: 6 },
  { from: 'A', to: 'D', weight: 8 },
  { from: 'B', to: 'C', weight: 7 },
  { from: 'B', to: 'D', weight: 10 },
  { from: 'C', to: 'D', weight: 3 },
]

const START = 'D'

const ALL_VERTICES = [...new Set(EDGES.flatMap(e => [e.from, e.to]))].sort()

const MATRIX: Record<string, Record<string, number>> = {}
for (const v of ALL_VERTICES) MATRIX[v] = {}
for (const e of EDGES) {
  MATRIX[e.from][e.to] = e.weight
  MATRIX[e.to][e.from] = e.weight
}

function Task1() {
  const [path, setPath] = useState<string[]>([])
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [current, setCurrent] = useState<string | null>(null)
  const [totalWeight, setTotalWeight] = useState(0)
  const [steps, setSteps] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [activeEdge, setActiveEdge] = useState<[string, string] | null>(null)

  function doNextStep() {
    if (done) return

    if (current === null) {
      setPath([START])
      setVisited(new Set([START]))
      setCurrent(START)
      setSteps([`Шаг 1: Начинаем с вершины ${START}.`])
      setActiveEdge(null)
      return
    }

    const unvisited = ALL_VERTICES.filter(v => !visited.has(v))

    if (unvisited.length === 0) {
      const w = MATRIX[current][START]
      if (w === undefined) {
        setSteps(prev => [...prev, `Ошибка: нет пути из ${current} в ${START}.`])
      } else {
        setPath(prev => [...prev, START])
        setTotalWeight(prev => prev + w)
        setActiveEdge([current, START])
        setSteps(prev => [
          ...prev,
          `Шаг ${prev.length + 1}: Все посещены. Возвращаемся в ${START} из ${current} (вес ${w}).`,
        ])
      }
      setDone(true)
      return
    }

    let minW = Infinity
    let next: string | null = null
    for (const v of unvisited) {
      const w = MATRIX[current][v]
      if (w !== undefined && w < minW) {
        minW = w
        next = v
      }
    }

    if (next === null) {
      setSteps(prev => [...prev, `Ошибка: нет пути из ${current}.`])
      setDone(true)
      return
    }

    const from = current
    const nextV = next
    setActiveEdge([from, nextV])
    setCurrent(nextV)
    setPath(prev => [...prev, nextV])
    setVisited(prev => new Set([...prev, nextV]))
    setTotalWeight(prev => prev + minW)
    setSteps(prev => [
      ...prev,
      `Шаг ${prev.length + 1}: Из ${from} → ${nextV} (вес ${minW}).`,
    ])
  }

  function reset() {
    setPath([])
    setVisited(new Set())
    setCurrent(null)
    setTotalWeight(0)
    setSteps([])
    setDone(false)
    setActiveEdge(null)
  }

  return (
    <div className="app-container">
      <h1>Упражнение 1</h1>
      <p>
        Пример 7.6. Примените алгоритм ближайшего соседа к графу, изображённому на рис. 7.11.
        За исходную вершину возьмите вершину D.
      </p>

      <div className="solver-container">
        <h2>Алгоритм Ближайшего Соседа (Nearest Neighbor)</h2>

        <div className="graph-visualizer">
          <h3>Граф:</h3>
          <div className="graph-nodes">
            <strong>Вершины:</strong> {ALL_VERTICES.join(', ')}
          </div>
          <div className="graph-edges">
            <strong>Рёбра:</strong>
            <ul>
              {EDGES.map((e, i) => {
                const isActive =
                  activeEdge !== null &&
                  ((activeEdge[0] === e.from && activeEdge[1] === e.to) ||
                    (activeEdge[0] === e.to && activeEdge[1] === e.from))
                return (
                  <li key={i} className={isActive ? 'highlight-edge' : ''}>
                    {e.from}–{e.to} (Вес: {e.weight})
                  </li>
                )
              })}
            </ul>
          </div>
          {path.length > 0 && (
            <div className="graph-path">
              <strong>Текущий путь: </strong>
              {path.map((v, i) => (
                <span key={i} className={i === path.length - 1 ? 'highlight-path-vertex' : ''}>
                  {v}{i < path.length - 1 ? ' → ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="controls">
          <button onClick={doNextStep} disabled={done}>
            Следующий шаг
          </button>
          <button onClick={reset}>Начать заново</button>
        </div>

        <div className="results">
          <h3>Ход выполнения:</h3>
          {steps.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
          {done && (
            <>
              <h4>Результат:</h4>
              <p className="final-path">Итоговый путь: {path.join(' → ')}</p>
              <p className="final-weight">Общий вес пути (длина цикла): {totalWeight}</p>
            </>
          )}
        </div>
      </div>

      <Link to="/2nTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  )
}

export default Task1
