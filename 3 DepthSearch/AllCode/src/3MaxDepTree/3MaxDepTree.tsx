import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

type TreeNode = { val: number; left?: TreeNode; right?: TreeNode }
type NodePos  = { val: number; x: number; y: number; id: string }
type EdgePos  = { x1: number; y1: number; x2: number; y2: number }

type DepthStep = {
  activeNode: number | null
  resolvedDepths: [number, number][]
  callStack: string[]
  deepestPath: number[]
  description: string
  finished: boolean
}

const NODE_R = 26
const LEVEL_H = 90
const SVG_W = 420

//       1
//      / \
//     2   3
//    / \
//   4   5
// Максимальная глубина = 3 (путь 1 → 2 → 4 или 1 → 2 → 5)

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

function computeDepthSteps(root: TreeNode): DepthStep[] {
  const steps: DepthStep[] = []
  const resolvedDepths: [number, number][] = []

  steps.push({
    activeNode: root.val, resolvedDepths: [], callStack: [`maxDepth(${root.val})`],
    deepestPath: [], finished: false,
    description: `Начинаем вычисление maxDepth(${root.val}). Рекурсивно вычислим глубину левого и правого поддерева.`,
  })
  steps.push({
    activeNode: 2, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(2)`],
    deepestPath: [], finished: false,
    description: `Рекурсивно вызываем maxDepth(2) — левый потомок узла 1. Идём дальше вглубь.`,
  })
  steps.push({
    activeNode: 4, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(2)`, `maxDepth(4)`],
    deepestPath: [], finished: false,
    description: `Рекурсивно вызываем maxDepth(4) — левый потомок узла 2. Узел 4 — лист: оба потомка null.`,
  })

  resolvedDepths.push([4, 1])
  steps.push({
    activeNode: 4, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(2)`, `maxDepth(4)`],
    deepestPath: [], finished: false,
    description: `maxDepth(null) = 0 для обоих потомков узла 4. maxDepth(4) = 1 + max(0, 0) = 1. Возвращаем 1.`,
  })
  steps.push({
    activeNode: 5, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(2)`, `maxDepth(5)`],
    deepestPath: [], finished: false,
    description: `Возвращаемся к узлу 2. Рекурсивно вызываем maxDepth(5) — правый потомок узла 2. Узел 5 — лист.`,
  })

  resolvedDepths.push([5, 1])
  steps.push({
    activeNode: 5, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(2)`, `maxDepth(5)`],
    deepestPath: [], finished: false,
    description: `maxDepth(null) = 0 для обоих потомков узла 5. maxDepth(5) = 1 + max(0, 0) = 1. Возвращаем 1.`,
  })

  resolvedDepths.push([2, 2])
  steps.push({
    activeNode: 2, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(2)`],
    deepestPath: [], finished: false,
    description: `Возвращаемся к узлу 2. maxDepth(2) = 1 + max(1, 1) = 2. Возвращаем 2.`,
  })
  steps.push({
    activeNode: 3, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(3)`],
    deepestPath: [], finished: false,
    description: `Возвращаемся к узлу 1. Рекурсивно вызываем maxDepth(3) — правый потомок. Узел 3 — лист.`,
  })

  resolvedDepths.push([3, 1])
  steps.push({
    activeNode: 3, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`, `maxDepth(3)`],
    deepestPath: [], finished: false,
    description: `maxDepth(null) = 0 для обоих потомков узла 3. maxDepth(3) = 1 + max(0, 0) = 1. Возвращаем 1.`,
  })

  resolvedDepths.push([1, 3])
  steps.push({
    activeNode: 1, resolvedDepths: [...resolvedDepths], callStack: [`maxDepth(1)`],
    deepestPath: [], finished: false,
    description: `Возвращаемся к узлу 1. maxDepth(1) = 1 + max(2, 1) = 3. Возвращаем 3.`,
  })
  steps.push({
    activeNode: null, resolvedDepths: [...resolvedDepths], callStack: [],
    deepestPath: [1, 2, 4], finished: true,
    description: `Готово! Максимальная глубина дерева = 3. Самый длинный путь: 1 → 2 → 4 (или 1 → 2 → 5).`,
  })

  return steps
}

// Вычисляем один раз при загрузке модуля
const ALL_STEPS = computeDepthSteps(EXAMPLE_TREE)
const ALL_POSITIONS: NodePos[] = []
const ALL_EDGES: EdgePos[] = []
buildLayout(EXAMPLE_TREE, 0, 0, SVG_W, 'root', ALL_POSITIONS, ALL_EDGES)

type TreeSVGProps = {
  positions: NodePos[]
  edges: EdgePos[]
  activeNode: number | null
  resolvedDepths: [number, number][]
  deepestPath: number[]
}

function TreeSVG({ positions, edges, activeNode, resolvedDepths, deepestPath }: TreeSVGProps) {
  const resolvedMap = new Map(resolvedDepths)
  const svgH = positions.length > 0 ? Math.max(...positions.map(p => p.y)) + NODE_R + 20 : 200

  const pathSet = new Set<string>()
  for (let i = 0; i < deepestPath.length - 1; i++) {
    pathSet.add(`${deepestPath[i]}-${deepestPath[i + 1]}`)
    pathSet.add(`${deepestPath[i + 1]}-${deepestPath[i]}`)
  }

  return (
    <svg width={SVG_W} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
      {edges.map((e, i) => {
        const from = positions.find(p => Math.abs(p.x - e.x1) < 1 && Math.abs(p.y - e.y1) < 1)
        const to   = positions.find(p => Math.abs(p.x - e.x2) < 1 && Math.abs(p.y - e.y2) < 1)
        const isPath = from && to && pathSet.has(`${from.val}-${to.val}`)
        return (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={isPath ? '#1565c0' : '#999'} strokeWidth={isPath ? 3 : 2} />
        )
      })}
      {positions.map(p => {
        const isCurrent  = p.val === activeNode
        const isResolved = resolvedMap.has(p.val)
        const isPath     = deepestPath.includes(p.val)
        const depth      = resolvedMap.get(p.val)

        let fill   = '#fff'
        let stroke = '#333'
        if (isPath && deepestPath.length > 0) { fill = '#1565c0'; stroke = '#0d47a1' }
        else if (isCurrent)  { fill = '#ff9800'; stroke = '#e65100' }
        else if (isResolved) { fill = '#4caf50'; stroke = '#388e3c' }

        const textColor = (isCurrent || isResolved || isPath) ? '#fff' : '#333'

        return (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={isCurrent || isPath ? 3 : 2} />
            <text x={p.x} y={p.y - (depth !== undefined ? 6 : 0)}
              textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight="bold" fill={textColor}>
              {p.val}
            </text>
            {depth !== undefined && (
              <text x={p.x} y={p.y + 12} textAnchor="middle" dominantBaseline="central" fontSize={12} fill={textColor}>
                d={depth}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function MaxDepTree() {
  const [stepIndex, setStepIndex] = useState(0)

  const current = ALL_STEPS[stepIndex]

  function handleNext() {
    setStepIndex(prev => Math.min(prev + 1, ALL_STEPS.length - 1))
  }

  function handleReset() {
    setStepIndex(0)
  }

  return (
    <div className="app-container">
      <h1>Задача 3: Максимальная глубина дерева</h1>
      <p>
        Определите глубину бинарного дерева — максимальное расстояние от корня до листа.
        Используется рекурсивный DFS: <code>maxDepth(node) = 1 + max(maxDepth(left), maxDepth(right))</code>.
      </p>

      <div className="solver-container">
        <h2>Визуализация дерева</h2>
        <div className="tree-visualizer">
          <TreeSVG
            positions={ALL_POSITIONS}
            edges={ALL_EDGES}
            activeNode={current.activeNode}
            resolvedDepths={current.resolvedDepths}
            deepestPath={current.deepestPath}
          />
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#ff9800', borderColor: '#e65100' }} />
              <span>Текущий узел</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#4caf50', borderColor: '#388e3c' }} />
              <span>Глубина вычислена</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#1565c0', borderColor: '#0d47a1' }} />
              <span>Самый длинный путь</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#fff', borderColor: '#333' }} />
              <span>Не обработан</span>
            </div>
          </div>
        </div>

        <div className="stack-display">
          <strong>Стек вызовов:</strong>
          <div className="stack-items">
            {current.callStack.length > 0
              ? current.callStack.map((c, i) => (
                  <span key={i} className="stack-item"
                    style={i === current.callStack.length - 1
                      ? { borderColor: '#ff9800', color: '#e65100', fontWeight: 'bold' }
                      : { opacity: 0.6 }
                    }
                  >{c}</span>
                ))
              : <span className="stack-empty">пустой</span>
            }
          </div>
        </div>

        <div className="controls">
          <button onClick={handleNext} disabled={current.finished}>Следующий шаг</button>
          <button onClick={handleReset}>Начать заново</button>
        </div>

        <div className="results">
          <h3>Ход выполнения:</h3>
          {ALL_STEPS.slice(0, stepIndex + 1).map((s, i) => (
            <p key={i}><strong>Шаг {i}:</strong> {s.description}</p>
          ))}
          {current.finished && (
            <>
              <h4>Результат:</h4>
              <p className="final-path">Максимальная глубина дерева: <strong>3</strong></p>
              <p>Самый длинный путь: <strong>1 → 2 → 4</strong> (или <strong>1 → 2 → 5</strong>)</p>
            </>
          )}
        </div>
      </div>

      <Link to="/2nTask">
        <button>Предыдущий алгоритм</button>
      </Link>
      <Link to="/4rTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  )
}

export default MaxDepTree
