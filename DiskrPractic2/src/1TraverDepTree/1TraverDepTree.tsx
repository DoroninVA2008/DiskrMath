import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

interface TreeNode {
  val: number
  left?: TreeNode
  right?: TreeNode
}

interface NodePos {
  val: number
  x: number
  y: number
  id: string
}

interface EdgePos {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface DFSStep {
  stack: number[]   
  visited: number[]
  currentNode: number | null
  description: string
}

const NODE_R = 26
const LEVEL_H = 90
const SVG_W = 420

// Пример:
// Вход: 
//       1
//      / \
//     2   3
//    / \
//   4   5
// Выход: [1, 2, 4, 5, 3]

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
  const mid = (left + right) / 2
  buildLayout(node.left,  depth + 1, left, mid, `${id}-L`, positions, edges, { x, y })
  buildLayout(node.right, depth + 1, mid, right, `${id}-R`, positions, edges, { x, y })
}

function computeDFSSteps(root: TreeNode): DFSStep[] {
  const steps: DFSStep[] = []

  const initStack: TreeNode[] = [root]
  steps.push({
    stack: initStack.map(n => n.val),
    visited: [],
    currentNode: null,
    description: `Инициализируем стек: помещаем корень ${root.val}. Стек: [${root.val}].`,
  })

  const stack: TreeNode[] = [root]
  const visited: number[] = []

  while (stack.length > 0) {
    const node = stack.pop()!
    visited.push(node.val)

    if (node.right) stack.push(node.right)
    if (node.left)  stack.push(node.left)

    const pushed: number[] = []
    if (node.right) pushed.push(node.right.val)
    if (node.left)  pushed.push(node.left.val)

    const pushedStr = pushed.length > 0
      ? ` Добавляем в стек: ${pushed.map(v => String(v)).join(', ')}.`
      : ' Нет дочерних узлов — ничего не добавляем.'

    const stackStr = stack.length > 0
      ? `[${stack.map(n => n.val).join(', ')}]`
      : '[]'

    steps.push({
      stack: stack.map(n => n.val),
      visited: [...visited],
      currentNode: node.val,
      description:
        `Извлекаем ${node.val} из стека — посещаем узел.` +
        pushedStr +
        ` Стек: ${stackStr}.`,
    })
  }

  return steps
}

interface TreeSVGProps {
  positions: NodePos[]
  edges: EdgePos[]
  visitedPrev: number[]
  currentVal: number | null
}

const TreeSVG: React.FC<TreeSVGProps> = ({ positions, edges, visitedPrev, currentVal }) => {
  const svgH = positions.length > 0
    ? Math.max(...positions.map(p => p.y)) + NODE_R + 20
    : 200

  return (
    <svg width={SVG_W} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1} y1={e.y1}
          x2={e.x2} y2={e.y2}
          stroke="#999"
          strokeWidth={2}
        />
      ))}

      {positions.map(p => {
        const isCurrent = p.val === currentVal
        const isVisited = visitedPrev.includes(p.val)

        const fill   = isCurrent ? '#ff9800' : isVisited ? '#4caf50' : '#fff'
        const stroke = isCurrent ? '#e65100' : '#333'
        const textColor = (isCurrent || isVisited) ? '#fff' : '#333'

        return (
          <g key={p.id}>
            <circle
              cx={p.x} cy={p.y} r={NODE_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={isCurrent ? 3 : 2}
            />
            <text
              x={p.x} y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight="bold"
              fill={textColor}
            >
              {p.val}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export const TraverDepTree: React.FC = () => {
  const steps = useMemo(() => computeDFSSteps(EXAMPLE_TREE), [])

  const { positions, edges } = useMemo(() => {
    const pos: NodePos[] = []
    const edg: EdgePos[] = []
    buildLayout(EXAMPLE_TREE, 0, 0, SVG_W, 'root', pos, edg)
    return { positions: pos, edges: edg }
  }, [])

  const [stepIndex, setStepIndex] = useState(0)

  const current = steps[stepIndex]
  const isFinished = stepIndex === steps.length - 1 && current.stack.length === 0

  const visitedPrev = isFinished
    ? current.visited                                    
    : current.visited.filter(v => v !== current.currentNode)

  const currentVal = isFinished ? null : current.currentNode

  const handleNext = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleReset = useCallback(() => {
    setStepIndex(0)
  }, [])

  return (
    <div className="app-container">
      <h1>Задача 1: Обход дерева в глубину (DFS)</h1>
      <p>
        Дано бинарное дерево. Вывести значения всех узлов в порядке DFS
        (префиксный обход: корень → левый → правый).
      </p>

      <div className="solver-container">
        <h2>Визуализация дерева</h2>
        <div className="tree-visualizer">
          <TreeSVG
            positions={positions}
            edges={edges}
            visitedPrev={visitedPrev}
            currentVal={currentVal}
          />
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#ff9800', borderColor: '#e65100' }} />
              <span>Текущий узел</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#4caf50', borderColor: '#388e3c' }} />
              <span>Посещён</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#fff', borderColor: '#333' }} />
              <span>Не посещён</span>
            </div>
          </div>
        </div>

        <div className="stack-display">
          <strong>Стек (top → right):</strong>
          <div className="stack-items">
            {current.stack.length > 0
              ? current.stack.map((v, i) => (
                  <span key={i} className="stack-item">{v}</span>
                ))
              : <span className="stack-empty">пустой</span>
            }
          </div>
        </div>

        <div className="controls">
          <button onClick={handleNext} disabled={isFinished}>
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

          {isFinished && (
            <>
              <h4>Результат:</h4>
              <p className="final-path">
                DFS (префиксный обход): [{current.visited.join(', ')}]
              </p>
            </>
          )}
        </div>
      </div>
      <Link to="/2nTask">
        <button>
          Следующий алгоритм
        </button>
      </Link>
    </div>
  )
}

export default TraverDepTree