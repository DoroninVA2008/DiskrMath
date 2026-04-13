import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

// Лабиринт из условия:
// [0, 1, 0]
// [0, 1, 0]
// [0, 0, 0]
// start = (0, 0), end = (2, 2) → True

const MAZE = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 0, 0],
]
const START: [number, number] = [0, 0]
const END:   [number, number] = [2, 2]

type Cell = [number, number]

interface SearchStep {
  stack: Cell[]
  visited: Cell[]
  current: Cell | null
  found: boolean
  finished: boolean
  description: string
}

function cellKey(c: Cell): string {
  return `${c[0]},${c[1]}`
}

function cellEq(a: Cell, b: Cell): boolean {
  return a[0] === b[0] && a[1] === b[1]
}

// DFS: 4 направления — вниз, вправо, вверх, влево
const DIRS: Cell[] = [[1, 0], [0, 1], [-1, 0], [0, -1]]
const DIR_NAMES = ['вниз', 'вправо', 'вверх', 'влево']

function computeSteps(maze: number[][], start: Cell, end: Cell): SearchStep[] {
  const rows = maze.length
  const cols = maze[0].length
  const steps: SearchStep[] = []

  steps.push({
    stack: [start],
    visited: [],
    current: null,
    found: false,
    finished: false,
    description:
      `Инициализируем стек: помещаем стартовую клетку (${start[0]},${start[1]}). ` +
      `Ищем путь до (${end[0]},${end[1]}).`,
  })

  const stack: Cell[] = [start]
  const visitedSet = new Set<string>()
  const visited: Cell[] = []

  while (stack.length > 0) {
    const cell = stack.pop()!
    const key = cellKey(cell)
    if (visitedSet.has(key)) continue
    visitedSet.add(key)
    visited.push(cell)

    if (cellEq(cell, end)) {
      steps.push({
        stack: [...stack],
        visited: [...visited],
        current: cell,
        found: true,
        finished: true,
        description:
          `Извлекаем (${cell[0]},${cell[1]}) из стека. ` +
          `Проверяем: (${cell[0]},${cell[1]}) === (${end[0]},${end[1]})? Да! Выход найден. Возвращаем True.`,
      })
      return steps
    }

    const added: string[] = []
    for (let d = 0; d < DIRS.length; d++) {
      const nr = cell[0] + DIRS[d][0]
      const nc = cell[1] + DIRS[d][1]
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 &&
        !visitedSet.has(cellKey([nr, nc]))
      ) {
        stack.push([nr, nc])
        added.push(`(${nr},${nc}) [${DIR_NAMES[d]}]`)
      }
    }

    const addedStr = added.length > 0
      ? ` Добавляем соседей: ${added.join(', ')}.`
      : ' Нет доступных соседей.'

    const stackStr = stack.length > 0
      ? stack.map(c => `(${c[0]},${c[1]})`).join(', ')
      : 'пустой'

    steps.push({
      stack: [...stack],
      visited: [...visited],
      current: cell,
      found: false,
      finished: false,
      description:
        `Извлекаем (${cell[0]},${cell[1]}) из стека. ` +
        `Это не выход.` +
        addedStr +
        ` Стек: [${stackStr}].`,
    })
  }

  steps.push({
    stack: [],
    visited: [...visited],
    current: null,
    found: false,
    finished: true,
    description: `Стек пуст. Путь до (${end[0]},${end[1]}) не найден. Возвращаем False.`,
  })

  return steps
}

// ──────────────────────────────────────────────
// Визуализация лабиринта через SVG
// ──────────────────────────────────────────────

const CELL_SIZE = 64
const GAP = 2

interface MazeSVGProps {
  maze: number[][]
  start: Cell
  end: Cell
  visited: Cell[]
  current: Cell | null
  foundCell: Cell | null
}

const MazeSVG: React.FC<MazeSVGProps> = ({ maze, start, end, visited, current, foundCell }) => {
  const rows = maze.length
  const cols = maze[0].length
  const W = cols * (CELL_SIZE + GAP) + GAP
  const H = rows * (CELL_SIZE + GAP) + GAP

  return (
    <svg
      width={W}
      height={H}
      style={{ display: 'block', margin: '0 auto', borderRadius: 6 }}
    >
      {maze.map((row, r) =>
        row.map((cell, c) => {
          const x = GAP + c * (CELL_SIZE + GAP)
          const y = GAP + r * (CELL_SIZE + GAP)

          const isWall    = cell === 1
          const isFound   = foundCell && cellEq([r, c], foundCell)
          const isCurrent = !isFound && current && cellEq([r, c], current)
          const isVisited = !isFound && !isCurrent && visited.some(v => cellEq(v, [r, c]))
          const isStart   = cellEq([r, c], start)
          const isEnd     = cellEq([r, c], end)

          let fill = '#fff'
          let textFill = '#333'
          if (isWall)    { fill = '#37474f'; textFill = '#fff' }
          if (isVisited) { fill = '#a5d6a7'; textFill = '#1b5e20' }
          if (isCurrent) { fill = '#ff9800'; textFill = '#fff' }
          if (isFound)   { fill = '#2196f3'; textFill = '#fff' }

          const label = isStart ? 'S' : isEnd ? 'E' : isWall ? '' : ''

          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x} y={y}
                width={CELL_SIZE} height={CELL_SIZE}
                rx={6}
                fill={fill}
                stroke={isCurrent ? '#e65100' : isFound ? '#0d47a1' : '#bbb'}
                strokeWidth={isCurrent || isFound ? 3 : 1.5}
              />
              {/* Координата */}
              {!isWall && (
                <text
                  x={x + CELL_SIZE / 2}
                  y={y + CELL_SIZE / 2 - (label ? 10 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fill={textFill}
                  opacity={0.7}
                >
                  {r},{c}
                </text>
              )}
              {/* Метка S / E */}
              {label && (
                <text
                  x={x + CELL_SIZE / 2}
                  y={y + CELL_SIZE / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={18}
                  fontWeight="bold"
                  fill={textFill}
                >
                  {label}
                </text>
              )}
              {/* Стена — крест */}
              {isWall && (
                <>
                  <line x1={x+14} y1={y+14} x2={x+CELL_SIZE-14} y2={y+CELL_SIZE-14} stroke="#78909c" strokeWidth={2.5} />
                  <line x1={x+CELL_SIZE-14} y1={y+14} x2={x+14} y2={y+CELL_SIZE-14} stroke="#78909c" strokeWidth={2.5} />
                </>
              )}
            </g>
          )
        })
      )}
    </svg>
  )
}

// ──────────────────────────────────────────────
// Главный компонент
// ──────────────────────────────────────────────

export const FindWayOutLabyrin: React.FC = () => {
  const steps = useMemo(() => computeSteps(MAZE, START, END), [])
  const [stepIndex, setStepIndex] = useState(0)

  const current = steps[stepIndex]

  const foundCell  = current.finished && current.found ? current.current : null
  const currentCell = current.finished && current.found ? null : current.current

  const visitedPrev = current.visited.filter(
    v => !(current.current && cellEq(v, current.current) && !current.finished)
  )

  const handleNext = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleReset = useCallback(() => {
    setStepIndex(0)
  }, [])

  return (
    <div className="app-container">
      <h1>Задача 13: Поиск выхода в лабиринте</h1>
      <p>
        Дан лабиринт (матрица N×M, <strong>0</strong> — проход, <strong>1</strong> — стена).
        Проверьте, существует ли путь от <strong>S (0,0)</strong> до <strong>E (2,2)</strong>.
        Алгоритм: DFS с использованием стека.
      </p>

      <div className="solver-container">
        <h2>Визуализация лабиринта</h2>
        <div className="tree-visualizer">
          <MazeSVG
            maze={MAZE}
            start={START}
            end={END}
            visited={visitedPrev}
            current={currentCell}
            foundCell={foundCell}
          />

          <div className="legend" style={{ marginTop: 16 }}>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#ff9800', borderColor: '#e65100', borderRadius: 4 }} />
              <span>Текущая клетка</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#2196f3', borderColor: '#0d47a1', borderRadius: 4 }} />
              <span>Выход найден</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#a5d6a7', borderColor: '#388e3c', borderRadius: 4 }} />
              <span>Посещена</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#fff', borderColor: '#bbb', borderRadius: 4 }} />
              <span>Проход (0)</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#37474f', borderColor: '#37474f', borderRadius: 4 }} />
              <span>Стена (1)</span>
            </div>
          </div>
        </div>

        {/* Стек */}
        <div className="stack-display">
          <strong>Стек (top → right):</strong>
          <div className="stack-items">
            {current.stack.length > 0
              ? current.stack.map((c, i) => (
                  <span key={i} className="stack-item">({c[0]},{c[1]})</span>
                ))
              : <span className="stack-empty">пустой</span>
            }
          </div>
        </div>

        <div className="controls">
          <button onClick={handleNext} disabled={current.finished}>
            Следующий шаг
          </button>
          <button onClick={handleReset}>
            Начать заново
          </button>
        </div>

        <div className="results">
          <h3>Ход выполнения:</h3>
          {steps.slice(0, stepIndex + 1).map((s, i) => (
            <p key={i}>
              <strong>Шаг {i}:</strong> {s.description}
            </p>
          ))}

          {current.finished && (
            <>
              <h4>Результат:</h4>
              <p className="final-path">
                Путь от (0,0) до (2,2):{' '}
                <strong style={{ color: current.found ? '#2196f3' : '#e53935' }}>
                  {current.found ? 'True' : 'False'}
                </strong>
              </p>
            </>
          )}
        </div>
      </div>

      <Link to="/5hTask">
        <button>Предыдущий алгоритм</button>
      </Link>
    </div>
  )
}

export default FindWayOutLabyrin
