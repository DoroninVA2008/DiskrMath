import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

type TreeNode = { val: number; left?: TreeNode; right?: TreeNode }
type NodePos  = { val: number; x: number; y: number; id: string }
type EdgePos  = { x1: number; y1: number; x2: number; y2: number; fromVal: number; toVal: number }

type MirrorStep = {
  tree: TreeNode
  activeNode: number | null
  doneNodes: number[]
  swapInfo: string
  description: string
  finished: boolean
}

const NODE_R = 26
const LEVEL_H = 90
const SVG_W = 420

// Исходное:       Зеркальное:
//       1               1
//      / \             / \
//     2   3           3   2
//    / \                 / \
//   4   5               5   4

function cloneTree(node: TreeNode | undefined): TreeNode | undefined {
  if (!node) return undefined
  return { val: node.val, left: cloneTree(node.left), right: cloneTree(node.right) }
}

const ORIGINAL_TREE: TreeNode = {
  val: 1,
  left: { val: 2, left: { val: 4 }, right: { val: 5 } },
  right: { val: 3 },
}

function buildMirrorSteps(): MirrorStep[] {
  const tree1: TreeNode = {
    val: 1,
    left: { val: 3 },
    right: { val: 2, left: { val: 4 }, right: { val: 5 } },
  }
  const tree3: TreeNode = {
    val: 1,
    left: { val: 3 },
    right: { val: 2, left: { val: 5 }, right: { val: 4 } },
  }

  return [
    {
      tree: cloneTree(ORIGINAL_TREE)!, activeNode: 1, doneNodes: [], swapInfo: '', finished: false,
      description: 'Начинаем. Рекурсивно меняем левые и правые поддеревья для каждого узла, начиная с корня 1.',
    },
    {
      tree: cloneTree(tree1)!, activeNode: 1, doneNodes: [1], swapInfo: '2 ↔ 3', finished: false,
      description: 'Узел 1: меняем местами левый потомок (2) и правый потомок (3). Теперь слева — 3, справа — 2.',
    },
    {
      tree: cloneTree(tree1)!, activeNode: 3, doneNodes: [1, 3], swapInfo: '', finished: false,
      description: 'Рекурсивно обрабатываем левый потомок узла 1 — узел 3. Узел 3 — лист, потомков нет. Ничего не меняем.',
    },
    {
      tree: cloneTree(tree3)!, activeNode: 2, doneNodes: [1, 3, 2], swapInfo: '4 ↔ 5', finished: false,
      description: 'Рекурсивно обрабатываем правый потомок узла 1 — узел 2. Меняем местами потомков (4) и (5).',
    },
    {
      tree: cloneTree(tree3)!, activeNode: 5, doneNodes: [1, 3, 2, 5], swapInfo: '', finished: false,
      description: 'Рекурсивно обрабатываем левый потомок узла 2 — узел 5. Узел 5 — лист. Ничего не меняем.',
    },
    {
      tree: cloneTree(tree3)!, activeNode: 4, doneNodes: [1, 3, 2, 5, 4], swapInfo: '', finished: false,
      description: 'Рекурсивно обрабатываем правый потомок узла 2 — узел 4. Узел 4 — лист. Ничего не меняем.',
    },
    {
      tree: cloneTree(tree3)!, activeNode: null, doneNodes: [1, 2, 3, 4, 5], swapInfo: '', finished: true,
      description: 'Готово! Зеркальное отражение построено. Все узлы обработаны.',
    },
  ]
}

function buildLayout(
  node: TreeNode | undefined,
  depth: number,
  left: number,
  right: number,
  id: string,
  positions: NodePos[],
  edges: EdgePos[],
  parentXY?: { x: number; y: number; val: number },
): void {
  if (!node) return
  const x = (left + right) / 2
  const y = depth * LEVEL_H + NODE_R + 10
  positions.push({ val: node.val, x, y, id })
  if (parentXY) {
    edges.push({ x1: parentXY.x, y1: parentXY.y, x2: x, y2: y, fromVal: parentXY.val, toVal: node.val })
  }
  buildLayout(node.left,  depth + 1, left, x, `${id}-L`, positions, edges, { x, y, val: node.val })
  buildLayout(node.right, depth + 1, x, right, `${id}-R`, positions, edges, { x, y, val: node.val })
}

// Вычисляем шаги один раз при загрузке модуля
const ALL_STEPS = buildMirrorSteps()

type TreeSVGProps = {
  tree: TreeNode
  activeNode: number | null
  doneNodes: number[]
  label?: string
  dimmed?: boolean
}

function TreeSVG({ tree, activeNode, doneNodes, label, dimmed }: TreeSVGProps) {
  // Позиции вычисляем каждый рендер (дерево маленькое, это быстро)
  const positions: NodePos[] = []
  const edges: EdgePos[] = []
  buildLayout(tree, 0, 0, SVG_W, 'root', positions, edges)

  const svgH = positions.length > 0 ? Math.max(...positions.map(p => p.y)) + NODE_R + 20 : 200

  return (
    <div style={{ opacity: dimmed ? 0.45 : 1, transition: 'opacity 0.3s' }}>
      {label && <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 4 }}>{label}</p>}
      <svg width={SVG_W} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#999" strokeWidth={2} />
        ))}
        {positions.map(p => {
          const isCurrent = p.val === activeNode
          const isDone    = doneNodes.includes(p.val)
          const fill      = isCurrent ? '#ff9800' : isDone ? '#4caf50' : '#fff'
          const stroke    = isCurrent ? '#e65100' : isDone ? '#388e3c' : '#333'
          const textColor = (isCurrent || isDone) ? '#fff' : '#333'
          return (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={isCurrent ? 3 : 2} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                fontSize={18} fontWeight="bold" fill={textColor}>{p.val}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function MiReflecTree() {
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
      <h1>Задача 4: Зеркальное отражение дерева</h1>
      <p>
        Создайте зеркальное отражение бинарного дерева — поменяйте местами левые и правые
        поддеревья для каждого узла. Алгоритм: рекурсивный DFS.
      </p>

      <div className="solver-container">
        {current.finished ? (
          <div>
            <h2>Результат: до и после</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              <TreeSVG tree={ORIGINAL_TREE} activeNode={null} doneNodes={[]} label="До (исходное)" />
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 36 }}>→</div>
              <TreeSVG tree={current.tree} activeNode={null} doneNodes={[1, 2, 3, 4, 5]} label="После (отражение)" />
            </div>
          </div>
        ) : (
          <div>
            <h2>Визуализация дерева</h2>
            <TreeSVG tree={current.tree} activeNode={current.activeNode} doneNodes={current.doneNodes} />
          </div>
        )}

        <div className="legend">
          <div className="legend-item">
            <div className="legend-box" style={{ background: '#ff9800', borderColor: '#e65100' }} />
            <span>Текущий узел</span>
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ background: '#4caf50', borderColor: '#388e3c' }} />
            <span>Обработан</span>
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ background: '#fff', borderColor: '#333' }} />
            <span>Не обработан</span>
          </div>
        </div>

        {current.swapInfo && (
          <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '1.2em', fontWeight: 'bold', color: '#e65100' }}>
            Обмен: {current.swapInfo}
          </div>
        )}

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
              <p className="final-path">
                Зеркальное дерево построено. Структура: 1 (левый: 3, правый: 2 (левый: 5, правый: 4))
              </p>
            </>
          )}
        </div>
      </div>

      <Link to="/3rTask">
        <button>Предыдущий алгоритм</button>
      </Link>
      <Link to="/5hTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  )
}

export default MiReflecTree
