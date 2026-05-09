import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

type TreeNode = { val: number; left?: TreeNode; right?: TreeNode }
type NodePos  = { val: number; x: number; y: number; id: string }
type EdgePos  = { x1: number; y1: number; x2: number; y2: number }

type BFSStep = {
  queue: number[]
  visited: number[]
  currentNode: number | null
  runningSum: number
  description: string
}

const NODE_R = 26
const LEVEL_H = 90
const SVG_W = 420

const EXAMPLE_TREE: TreeNode = {
  val: 1,
  left: {
    val: 2,
    left: { val: 4 },
    right: { val: 5 },
  },
  right: { val: 3 },
}

function buildLayout(
  node: TreeNode | undefined,
  depth: number,
  left: number,
  right: number,
  id: string,
  positions: NodePos[],
  edges: EdgePos[],
  parentXY?: { x: number; y: number },
): void {
  if (!node) return
  const x = (left + right) / 2
  const y = depth * LEVEL_H + NODE_R + 10
  positions.push({ val: node.val, x, y, id })
  if (parentXY) {
    edges.push({ x1: parentXY.x, y1: parentXY.y, x2: x, y2: y })
  }
  buildLayout(node.left,  depth + 1, left, x, `${id}-L`, positions, edges, { x, y })
  buildLayout(node.right, depth + 1, x, right, `${id}-R`, positions, edges, { x, y })
}

function computeBFSSteps(root: TreeNode): BFSStep[] {
  const steps: BFSStep[] = []

  steps.push({
    queue: [root.val],
    visited: [],
    currentNode: null,
    runningSum: 0,
    description: `Инициализируем очередь: помещаем корень ${root.val}. Сумма = 0.`,
  })

  const queue: TreeNode[] = [root]
  const visited: number[] = []
  let runningSum = 0

  while (queue.length > 0) {
    const node = queue.shift()!
    visited.push(node.val)
    runningSum += node.val

    if (node.left)  queue.push(node.left)
    if (node.right) queue.push(node.right)

    const enqueued: number[] = []
    if (node.left)  enqueued.push(node.left.val)
    if (node.right) enqueued.push(node.right.val)

    const enqueuedStr = enqueued.length > 0
      ? ` Добавляем в очередь: ${enqueued.join(', ')}.`
      : ' Нет дочерних узлов.'

    const queueStr = queue.length > 0 ? `[${queue.map(n => n.val).join(', ')}]` : '[]'

    const step: BFSStep = {
      queue: queue.map(n => n.val),
      visited: [...visited],
      currentNode: node.val,
      runningSum,
      description:
        `Извлекаем ${node.val} из очереди. Сумма: ${runningSum - node.val} + ${node.val} = ${runningSum}.` +
        enqueuedStr +
        ` Очередь: ${queueStr}.`,
    }

    if (queue.length === 0) {
      step.description += ` Итого: ${visited.join(' + ')} = ${runningSum}.`
    }

    steps.push(step)
  }

  return steps
}

// Вычисляем один раз при загрузке модуля
const ALL_STEPS = computeBFSSteps(EXAMPLE_TREE)
const ALL_POSITIONS: NodePos[] = []
const ALL_EDGES: EdgePos[] = []
buildLayout(EXAMPLE_TREE, 0, 0, SVG_W, 'root', ALL_POSITIONS, ALL_EDGES)

type TreeSVGProps = {
  positions: NodePos[]
  edges: EdgePos[]
  visitedPrev: number[]
  currentVal: number | null
}

function TreeSVG({ positions, edges, visitedPrev, currentVal }: TreeSVGProps) {
  const svgH = positions.length > 0 ? Math.max(...positions.map(p => p.y)) + NODE_R + 20 : 200

  return (
    <svg width={SVG_W} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#999" strokeWidth={2} />
      ))}
      {positions.map(p => {
        const isCurrent = p.val === currentVal
        const isVisited = visitedPrev.includes(p.val)
        const fill      = isCurrent ? '#ff9800' : isVisited ? '#4caf50' : '#fff'
        const stroke    = isCurrent ? '#e65100' : '#333'
        const textColor = (isCurrent || isVisited) ? '#fff' : '#333'
        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={isCurrent ? 3 : 2} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
              fontSize={18} fontWeight="bold" fill={textColor}>{p.val}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SumAllNodes() {
  const [stepIndex, setStepIndex] = useState(0)

  const current    = ALL_STEPS[stepIndex]
  const isFinished = stepIndex === ALL_STEPS.length - 1 && current.queue.length === 0

  const visitedPrev = isFinished
    ? current.visited
    : current.visited.filter(v => v !== current.currentNode)
  const currentVal = isFinished ? null : current.currentNode

  function handleNext() {
    setStepIndex(prev => Math.min(prev + 1, ALL_STEPS.length - 1))
  }

  function handleReset() {
    setStepIndex(0)
  }

  return (
    <div className="app-container">
      <h1>Задача 2: Сумма значений всех узлов</h1>
      <p>
        Найдите сумму всех значений узлов бинарного дерева.
        Используется обход в ширину (BFS) с накоплением суммы.
      </p>

      <div className="solver-container">
        <h2>Визуализация дерева</h2>
        <div className="tree-visualizer">
          <TreeSVG positions={ALL_POSITIONS} edges={ALL_EDGES} visitedPrev={visitedPrev} currentVal={currentVal} />
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#ff9800', borderColor: '#e65100' }} />
              <span>Текущий узел</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#4caf50', borderColor: '#388e3c' }} />
              <span>Добавлен в сумму</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#fff', borderColor: '#333' }} />
              <span>Не обработан</span>
            </div>
          </div>
        </div>

        <div className="stack-display">
          <strong>Текущая сумма:</strong>
          <span style={{ marginLeft: 12, fontSize: '1.4em', fontWeight: 'bold', color: isFinished ? '#2e7d32' : '#1a73e8' }}>
            {current.runningSum}
          </span>
          {current.visited.length > 0 && (
            <span style={{ marginLeft: 10, color: '#666', fontSize: '0.95em' }}>
              ({current.visited.join(' + ')})
            </span>
          )}
        </div>

        <div className="stack-display">
          <strong>Очередь BFS (front → left):</strong>
          <div className="stack-items">
            {current.queue.length > 0
              ? current.queue.map((v, i) => (
                  <span key={i} className="stack-item" style={{ borderColor: '#ff9800', color: '#e65100' }}>{v}</span>
                ))
              : <span className="stack-empty">пустая</span>
            }
          </div>
        </div>

        <div className="controls">
          <button onClick={handleNext} disabled={isFinished}>Следующий шаг</button>
          <button onClick={handleReset}>Начать заново</button>
        </div>

        <div className="results">
          <h3>Ход выполнения:</h3>
          {ALL_STEPS.slice(0, stepIndex + 1).map((s, i) => (
            <p key={i}><strong>Шаг {i}:</strong> {s.description}</p>
          ))}
          {isFinished && (
            <>
              <h4>Результат:</h4>
              <p className="final-path">
                Сумма всех узлов: {current.visited.join(' + ')} = {current.runningSum}
              </p>
            </>
          )}
        </div>
      </div>

      <Link to="/1sTask">
        <button>Предыдущий алгоритм</button>
      </Link>
      <Link to="/3rTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  )
}

export default SumAllNodes
