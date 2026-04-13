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

interface SearchStep {
  stack: number[]
  visited: number[]
  currentNode: number | null
  found: boolean
  finished: boolean
  description: string
}

const NODE_R = 26
const LEVEL_H = 90
const SVG_W = 420

// Дерево из задачи 1:
//       1
//      / \
//     2   3
//    / \
//   4   5
// target = 5 → True

const TARGET = 5

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

function computeSearchSteps(root: TreeNode, target: number): SearchStep[] {
  const steps: SearchStep[] = []

  steps.push({
    stack: [root.val],
    visited: [],
    currentNode: null,
    found: false,
    finished: false,
    description: `Ищем значение ${target}. Инициализируем стек: помещаем корень ${root.val}. Стек: [${root.val}].`,
  })

  const stack: TreeNode[] = [root]
  const visited: number[] = []

  while (stack.length > 0) {
    const node = stack.pop()!
    visited.push(node.val)

    const isMatch = node.val === target

    if (node.right) stack.push(node.right)
    if (node.left)  stack.push(node.left)

    if (isMatch) {
      steps.push({
        stack: stack.map(n => n.val),
        visited: [...visited],
        currentNode: node.val,
        found: true,
        finished: true,
        description:
          `Извлекаем ${node.val} из стека. Проверяем: ${node.val} === ${target}? Да! Элемент найден. Возвращаем True.`,
      })
      return steps
    }

    const pushed: number[] = []
    if (node.right) pushed.push(node.right.val)
    if (node.left)  pushed.push(node.left.val)

    const pushedStr = pushed.length > 0
      ? ` Добавляем в стек: ${pushed.join(', ')}.`
      : ' Нет дочерних узлов — ничего не добавляем.'

    const stackStr = stack.length > 0 ? `[${stack.map(n => n.val).join(', ')}]` : '[]'

    steps.push({
      stack: stack.map(n => n.val),
      visited: [...visited],
      currentNode: node.val,
      found: false,
      finished: false,
      description:
        `Извлекаем ${node.val} из стека. Проверяем: ${node.val} === ${target}? Нет.` +
        pushedStr +
        ` Стек: ${stackStr}.`,
    })
  }

  // Элемент не найден
  steps.push({
    stack: [],
    visited: [...visited],
    currentNode: null,
    found: false,
    finished: true,
    description: `Стек пуст. Элемент ${target} не найден. Возвращаем False.`,
  })

  return steps
}

interface TreeSVGProps {
  positions: NodePos[]
  edges: EdgePos[]
  visitedPrev: number[]
  currentVal: number | null
  foundVal: number | null
}

const TreeSVG: React.FC<TreeSVGProps> = ({ positions, edges, visitedPrev, currentVal, foundVal }) => {
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
        const isFound   = p.val === foundVal
        const isCurrent = !isFound && p.val === currentVal
        const isVisited = !isFound && visitedPrev.includes(p.val)

        const fill      = isFound ? '#2196f3' : isCurrent ? '#ff9800' : isVisited ? '#4caf50' : '#fff'
        const stroke    = isFound ? '#0d47a1' : isCurrent ? '#e65100' : isVisited ? '#388e3c' : '#333'
        const textColor = (isFound || isCurrent || isVisited) ? '#fff' : '#333'

        return (
          <g key={p.id}>
            <circle
              cx={p.x} cy={p.y} r={NODE_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={(isFound || isCurrent) ? 3 : 2}
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

export const FindElemenTree: React.FC = () => {
  const steps = useMemo(() => computeSearchSteps(EXAMPLE_TREE, TARGET), [])

  const { positions, edges } = useMemo(() => {
    const pos: NodePos[] = []
    const edg: EdgePos[] = []
    buildLayout(EXAMPLE_TREE, 0, 0, SVG_W, 'root', pos, edg)
    return { positions: pos, edges: edg }
  }, [])

  const [stepIndex, setStepIndex] = useState(0)

  const current = steps[stepIndex]

  const visitedPrev = current.finished && current.found
    ? current.visited.filter(v => v !== current.currentNode)
    : current.visited.filter(v => v !== current.currentNode)

  const currentVal  = current.finished && current.found ? null : current.currentNode
  const foundVal    = current.finished && current.found ? current.currentNode : null

  const handleNext = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleReset = useCallback(() => {
    setStepIndex(0)
  }, [])

  return (
    <div className="app-container">
      <h1>Задача 5: Поиск элемента в дереве</h1>
      <p>
        Проверьте, существует ли значение <strong>target = {TARGET}</strong> в бинарном дереве.
        Алгоритм: DFS с использованием стека.
      </p>

      <div className="solver-container">
        <h2>Визуализация дерева</h2>
        <div className="tree-visualizer">
          <TreeSVG
            positions={positions}
            edges={edges}
            visitedPrev={visitedPrev}
            currentVal={currentVal}
            foundVal={foundVal}
          />
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#ff9800', borderColor: '#e65100' }} />
              <span>Текущий узел</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#2196f3', borderColor: '#0d47a1' }} />
              <span>Найден!</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#4caf50', borderColor: '#388e3c' }} />
              <span>Проверен</span>
            </div>
            <div className="legend-item">
              <div className="legend-box" style={{ background: '#fff', borderColor: '#333' }} />
              <span>Не проверен</span>
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
                Значение {TARGET} в дереве:{' '}
                <strong style={{ color: current.found ? '#2196f3' : '#e53935' }}>
                  {current.found ? 'True' : 'False'}
                </strong>
              </p>
            </>
          )}
        </div>
      </div>

      <Link to="/4rTask">
        <button>Предыдущий алгоритм</button>
      </Link>
      <Link to="/6hTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  )
}

export default FindElemenTree
