import { useState, useEffect, useRef } from 'react'

const NODE_POS: Record<number, { x: number; y: number }> = {
  0:  { x: 310, y: 45  },
  1:  { x: 190, y: 120 },
  2:  { x: 430, y: 120 },
  3:  { x: 105, y: 200 },
  4:  { x: 310, y: 200 },
  5:  { x: 515, y: 200 },
  6:  { x: 60,  y: 285 },
  7:  { x: 220, y: 285 },
  8:  { x: 400, y: 285 },
  9:  { x: 560, y: 285 },
  10: { x: 30,  y: 370 },
  11: { x: 145, y: 370 },
  12: { x: 310, y: 370 },
  13: { x: 560, y: 370 },
}

const EDGES: [number, number][] = [
  [0, 1], [0, 2],
  [1, 3], [1, 4],
  [2, 4], [2, 5],
  [3, 6],
  [4, 7], [4, 8],
  [5, 9],
  [6, 10], [6, 11],
  [7, 11],
  [8, 12],
  [9, 13],
]

const ADJ: Record<number, number[]> = {}
for (const [a, b] of EDGES) {
  if (!ADJ[a]) ADJ[a] = []
  if (!ADJ[b]) ADJ[b] = []
  ADJ[a].push(b)
  ADJ[b].push(a)
}
for (const key of Object.keys(ADJ)) {
  const k = Number(key)
  ADJ[k].sort((x, y) => x - y)
}

const START  = 0
const TARGET = 10

type Step = {
  phase:    'dequeue' | 'explore' | 'found'
  current:  number
  queue:    number[]
  visited:  number[]
  parent:   Record<number, number>
  newEdge?: [number, number]
  path:     number[]
  desc:     string
}

function buildSteps(): Step[] {
  const steps: Step[] = []
  const visited = new Set<number>([START])
  const parent: Record<number, number> = {}
  const queue: number[] = [START]

  steps.push({
    phase: 'dequeue', current: -1,
    queue: [...queue], visited: [...visited], parent: {},
    path: [], desc: `Добавляем стартовый узел ${START} в очередь. Очередь: [${START}]`,
  })

  while (queue.length > 0) {
    const cur = queue.shift()!

    if (cur === TARGET) {
      const path: number[] = []
      let v: number | undefined = cur
      while (v !== undefined) { path.unshift(v); v = parent[v] }
      steps.push({
        phase: 'found', current: cur,
        queue: [...queue], visited: [...visited], parent: { ...parent },
        path, desc: `Извлекаем ${cur} — это ЦЕЛЬ! Путь: ${path.join(' → ')}`,
      })
      break
    }

    steps.push({
      phase: 'dequeue', current: cur,
      queue: [...queue], visited: [...visited], parent: { ...parent },
      path: [], desc: `Извлекаем ${cur} из очереди. Обрабатываем соседей…`,
    })

    for (const nb of ADJ[cur] ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb)
        parent[nb] = cur
        queue.push(nb)
        steps.push({
          phase: 'explore', current: cur,
          queue: [...queue], visited: [...visited], parent: { ...parent },
          newEdge: [cur, nb], path: [],
          desc: `Сосед ${nb} не посещён → добавляем в очередь. Очередь: [${[...queue].join(', ')}]`,
        })
      }
    }
  }

  return steps
}

const ALL_STEPS = buildSteps()

function getNodeColor(id: number, step: Step): string {
  if (step.path.includes(id))                  return '#22c55e'
  if (id === TARGET && step.phase !== 'found') return '#16a34a'
  if (id === START && step.current === -1)     return '#38bdf8'
  if (id === step.current)                     return '#f97316'
  if (step.queue.includes(id))                 return '#fbbf24'
  if (step.visited.includes(id))               return '#60a5fa'
  return '#9fb3c8'
}

function getEdgeStyle(a: number, b: number, step: Step) {
  if (
    step.path.length > 1 &&
    step.path.includes(a) && step.path.includes(b) &&
    Math.abs(step.path.indexOf(a) - step.path.indexOf(b)) === 1
  ) return { stroke: '#22c55e', strokeWidth: 3 }

  if (
    step.newEdge &&
    ((step.newEdge[0] === a && step.newEdge[1] === b) ||
     (step.newEdge[0] === b && step.newEdge[1] === a))
  ) return { stroke: '#f59e0b', strokeWidth: 2.5 }

  return { stroke: '#94a3b8', strokeWidth: 1.5 }
}

const LEGEND = [
  { color: '#9fb3c8', label: 'Не посещён' },
  { color: '#38bdf8', label: 'Старт' },
  { color: '#fbbf24', label: 'В очереди' },
  { color: '#f97316', label: 'Текущий' },
  { color: '#60a5fa', label: 'Посещён' },
  { color: '#22c55e', label: 'Путь / Цель' },
]

export default function BFS() {
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step    = ALL_STEPS[idx]
  const isFirst = idx === 0
  const isLast  = idx === ALL_STEPS.length - 1

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setIdx(i => {
          if (i >= ALL_STEPS.length - 1) { setPlaying(false); return i }
          return i + 1
        })
      }, 900)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing])

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>BFS — Поиск в ширину</h2>
        <p>
          Дан граф. Найти кратчайший путь от узла&nbsp;
          <strong style={{ color: '#1a73e8' }}>{START}</strong>
          &nbsp;до узла&nbsp;
          <strong style={{ color: '#22863a' }}>{TARGET}</strong>
          &nbsp;методом обхода в ширину (BFS).
        </p>
      </div>

      <div className="section-title">Визуализация графа</div>
      <div className="graph-wrapper">
        <svg viewBox="0 0 620 410" width="100%" style={{ display: 'block' }}>
          {EDGES.map(([a, b]) => {
            const { stroke, strokeWidth } = getEdgeStyle(a, b, step)
            const pa = NODE_POS[a], pb = NODE_POS[b]
            return (
              <line key={`${a}-${b}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={stroke} strokeWidth={strokeWidth}
              />
            )
          })}
          {Object.entries(NODE_POS).map(([idStr, { x, y }]) => {
            const id = Number(idStr)
            return (
              <g key={id}>
                <circle cx={x} cy={y} r={17} fill={getNodeColor(id, step)} stroke="#fff" strokeWidth={2} />
                <text x={x} y={y + 4} textAnchor="middle" fill="#fff"
                  fontSize={id >= 10 ? 10 : 12} fontWeight="bold">{id}</text>
                {id === START  && <text x={x + 21} y={y + 4} fill="#1a73e8" fontSize={11}>start</text>}
                {id === TARGET && <text x={x + 21} y={y + 4} fill="#22863a" fontSize={11}>target</text>}
              </g>
            )
          })}
        </svg>

        <div className="legend">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="legend-item">
              <div className="legend-dot" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="step-info">
        <div className="step-counter">
          Шаг <strong>{idx}</strong> из {ALL_STEPS.length - 1}
        </div>
        <div>Текущий узел: <strong style={{ color: '#f97316' }}>{step.current === -1 ? '—' : step.current}</strong></div>
        <div>Очередь: <strong style={{ color: '#d97706' }}>[{step.queue.join(', ')}]</strong></div>
        <div>Посещённые: <strong style={{ color: '#2563eb' }}>{'{'}{ step.visited.join(', ') }{'}'}</strong></div>
        {step.phase === 'found' && (
          <div className="found-msg">Цель найдена! Путь: {step.path.join(' → ')}</div>
        )}
        <div className="step-desc">{step.desc}</div>
      </div>

      <div className="controls">
        <button disabled={isFirst} onClick={() => { setPlaying(false); setIdx(0) }}>⏮ В начало</button>
        <button disabled={isFirst} onClick={() => setIdx(i => Math.max(0, i - 1))}>← Назад</button>
        <button disabled={isLast}  onClick={() => setPlaying(p => !p)}>{playing ? '⏸ Пауза' : '▶ Авто'}</button>
        <button disabled={isLast}  onClick={() => setIdx(i => Math.min(ALL_STEPS.length - 1, i + 1))}>Вперёд →</button>
        <button disabled={isLast}  onClick={() => { setPlaying(false); setIdx(ALL_STEPS.length - 1) }}>В конец ⏭</button>
      </div>
    </div>
  )
}
