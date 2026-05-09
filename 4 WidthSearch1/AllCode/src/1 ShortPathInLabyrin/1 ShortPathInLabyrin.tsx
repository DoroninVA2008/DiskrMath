import { useState, useEffect, useRef } from 'react'

type Cell = 0 | 1
type Pos = [number, number]
type EditMode = 'wall' | 'start' | 'end'

const DIRS: Pos[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

interface BFSStep {
  current: Pos
  queue: Pos[]
  distMap: number[][]
  found: boolean
  path: Pos[]
}

function buildSteps(maze: Cell[][], start: Pos, end: Pos): BFSStep[] {
  const size = maze.length
  const [startRow, startCol] = start
  const [endRow, endCol] = end
  const steps: BFSStep[] = []

  if (maze[startRow]?.[startCol] !== 0 || maze[endRow]?.[endCol] !== 0) return steps

  const distMap: number[][] = Array.from({ length: size }, () => Array(size).fill(-1))
  const parent: (Pos | null)[][] = Array.from({ length: size }, () => Array(size).fill(null))
  distMap[startRow][startCol] = 0
  const queue: Pos[] = [[startRow, startCol]]

  while (queue.length > 0) {
    const [row, col] = queue.shift()!

    if (row === endRow && col === endCol) {
      const path: Pos[] = []
      let cur: Pos | null = [row, col]
      while (cur !== null) {
        path.unshift(cur)
        cur = parent[cur[0]][cur[1]]
      }
      steps.push({
        current: [row, col],
        queue: [...queue],
        distMap: distMap.map(r => [...r]),
        found: true,
        path,
      })
      break
    }

    for (const [dRow, dCol] of DIRS) {
      const nextRow = row + dRow
      const nextCol = col + dCol
      const inBounds = nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size
      if (inBounds && maze[nextRow][nextCol] === 0 && distMap[nextRow][nextCol] === -1) {
        distMap[nextRow][nextCol] = distMap[row][col] + 1
        parent[nextRow][nextCol] = [row, col]
        queue.push([nextRow, nextCol])
      }
    }

    steps.push({
      current: [row, col],
      queue: [...queue],
      distMap: distMap.map(r => [...r]),
      found: false,
      path: [],
    })
  }

  return steps
}

const DEFAULT_MAZE: Cell[][] = [[0,0,0],[1,1,0],[0,0,0]]
const DEFAULT_START: Pos = [0, 0]
const DEFAULT_END: Pos = [2, 2]

function cellPx(n: number) { return n <= 5 ? 56 : n <= 7 ? 46 : 38 }

export default function ShortPathInLabyrin() {
  const [maze, setMaze] = useState<Cell[][]>(DEFAULT_MAZE)
  const [n, setN] = useState(3)
  const [start, setStart] = useState<Pos>(DEFAULT_START)
  const [end, setEnd] = useState<Pos>(DEFAULT_END)
  const [mode, setMode] = useState<EditMode>('wall')
  const [stepIdx, setStepIdx] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const steps = buildSteps(maze, start, end)
  const step = stepIdx !== null ? steps[stepIdx] : null
  const isLast = stepIdx !== null && stepIdx >= steps.length - 1

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= steps.length - 1) { setPlaying(false); return i }
          return i + 1
        })
      }, 450)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, steps.length])

  function handleCell(r: number, c: number) {
    if (mode === 'wall') {
      const isStartOrEnd = (r === start[0] && c === start[1]) || (r === end[0] && c === end[1])
      if (isStartOrEnd) return
      setMaze(prev =>
        prev.map((row, ri) =>
          row.map((cell, ci) => (ri === r && ci === c ? (cell === 0 ? 1 : 0) : cell)) as Cell[]
        )
      )
    } else if (mode === 'start') {
      if (maze[r][c] === 1) return
      setStart([r, c])
    } else {
      if (maze[r][c] === 1) return
      setEnd([r, c])
    }
    setStepIdx(null)
    setPlaying(false)
  }

  function handleN(newN: number) {
    const newMaze: Cell[][] = Array.from({ length: newN }, (_, r) =>
      Array.from({ length: newN }, (_, c) =>
        r < maze.length && c < maze[0].length ? maze[r][c] : 0
      ) as Cell[]
    )
    setN(newN)
    setMaze(newMaze)
    setStart([0, 0])
    setEnd([newN - 1, newN - 1])
    setStepIdx(null)
    setPlaying(false)
  }

  function randomMaze() {
    const newMaze: Cell[][] = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => {
        if ((r === 0 && c === 0) || (r === n - 1 && c === n - 1)) return 0
        return Math.random() < 0.28 ? 1 : 0
      }) as Cell[]
    )
    setMaze(newMaze)
    setStart([0, 0])
    setEnd([n - 1, n - 1])
    setStepIdx(null)
    setPlaying(false)
  }

  function reset() {
    setMaze(DEFAULT_MAZE)
    setN(3)
    setStart(DEFAULT_START)
    setEnd(DEFAULT_END)
    setStepIdx(null)
    setPlaying(false)
  }

  function getCellInfo(r: number, c: number) {
    const isS = r === start[0] && c === start[1]
    const isE = r === end[0] && c === end[1]
    if (maze[r][c] === 1) return { bg: '#374151', label: '', tc: '#fff' }

    if (!step) {
      if (isS) return { bg: '#1a73e8', label: 'S', tc: '#fff' }
      if (isE) return { bg: '#16a34a', label: 'E', tc: '#fff' }
      return { bg: '#f1f5f9', label: '', tc: '' }
    }

    const dist = step.distMap[r][c]
    const inPath = step.path.some(([pr, pc]) => pr === r && pc === c)
    const isCur = step.current[0] === r && step.current[1] === c
    const inQueue = step.queue.some(([qr, qc]) => qr === r && qc === c)
    const base = isS ? 'S' : isE ? 'E' : ''
    const label = base || (dist >= 0 ? String(dist) : '')

    if (inPath)  return { bg: '#fbbf24', label, tc: '#1e293b' }
    if (isCur)   return { bg: '#f97316', label, tc: '#fff' }
    if (inQueue) return { bg: '#818cf8', label, tc: '#fff' }
    if (dist >= 0) return { bg: '#90caf9', label, tc: '#1e293b' }
    if (isS) return { bg: '#1a73e8', label: 'S', tc: '#fff' }
    if (isE) return { bg: '#16a34a', label: 'E', tc: '#fff' }
    return { bg: '#f1f5f9', label: '', tc: '' }
  }

  const lastStep = steps.at(-1)
  const previewResult = lastStep?.found
    ? `Кратчайший путь: ${lastStep.path.length - 1} шаг(а)`
    : steps.length > 0 ? 'Путь невозможен → -1' : 'Старт или цель стоит на стене'

  const cs = cellPx(n)

  const selectStyle: React.CSSProperties = {
    padding: '3px 6px', border: '1px solid #ccc', borderRadius: 4,
    fontSize: 13, background: '#fff',
  }

  return (
    <div style={{ padding: 20, maxWidth: 640, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ marginBottom: 4 }}>1. Кратчайший путь в лабиринте</h2>
      <p style={{ color: '#555', margin: '0 0 16px', fontSize: 14 }}>
        Матрица N×N: <strong>0</strong> — проход, <strong>1</strong> — стена.
        Найти минимум шагов от <span style={{ color: '#1a73e8' }}>S</span> до{' '}
        <span style={{ color: '#16a34a' }}>E</span>. Если путь невозможен — вернуть{' '}
        <strong style={{ color: '#f44336' }}>-1</strong>.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <label style={{ fontSize: 13 }}>
          Размер:&nbsp;
          <select value={n} onChange={e => handleN(Number(e.target.value))} style={selectStyle}>
            {[3,4,5,6,7,8].map(v => <option key={v} value={v}>{v}×{v}</option>)}
          </select>
        </label>

        {(['wall','start','end'] as EditMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 10px', fontSize: 13,
            border: mode === m ? '2px solid #1a73e8' : '1px solid #ccc',
            background: mode === m ? '#e3f2fd' : '#fff',
            color: m === 'start' ? '#1a73e8' : m === 'end' ? '#16a34a' : '#333',
            borderRadius: 6, cursor: 'pointer',
          }}>
            {m === 'wall' ? '🧱 Стена' : m === 'start' ? 'S Старт' : 'E Цель'}
          </button>
        ))}

        <button onClick={randomMaze}>🎲 Случайный</button>
        <button onClick={reset}>↩ Сброс</button>
      </div>

      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${n}, ${cs}px)`,
        gap: 3, background: '#e2e8f0', padding: 10, borderRadius: 10,
      }}>
        {maze.map((row, r) => row.map((_, c) => {
          const { bg, label, tc } = getCellInfo(r, c)
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCell(r, c)}
              style={{
                width: cs, height: cs, background: bg, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: cs > 50 ? 14 : 12, fontWeight: 'bold', color: tc,
                cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s',
              }}
            >
              {label}
            </div>
          )
        }))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { bg: '#f1f5f9', label: 'Проход', border: '1px solid #ccc' },
          { bg: '#374151', label: 'Стена' },
          { bg: '#1a73e8', label: 'Старт S' },
          { bg: '#16a34a', label: 'Цель E' },
          { bg: '#f97316', label: 'Текущий' },
          { bg: '#818cf8', label: 'В очереди' },
          { bg: '#90caf9', label: 'Посещён' },
          { bg: '#fbbf24', label: 'Путь' },
        ].map(({ bg, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: bg, border: border ?? 'none', flexShrink: 0 }} />
            <span style={{ color: '#555' }}>{label}</span>
          </div>
        ))}
      </div>

      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#f8f9fa', border: '1px solid #dde3ea', borderRadius: 8, fontSize: 14 }}>
          <span style={{ color: lastStep?.found ? '#2e7d32' : '#c62828' }}>{previewResult}</span>
        </div>
      )}

      {step && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#f8f9fa', border: '1px solid #dde3ea', borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: '#555', marginBottom: 2 }}>
            Шаг <strong>{stepIdx! + 1}</strong> из {steps.length}
          </div>
          <div>
            Текущая клетка:{' '}
            <strong style={{ color: '#f97316' }}>({step.current[0]}, {step.current[1]})</strong>
            {' '}— расстояние от старта: <strong>{step.distMap[step.current[0]][step.current[1]]}</strong>
          </div>
          <div>
            Очередь:{' '}
            <strong style={{ color: '#818cf8' }}>
              [{step.queue.map(([r, c]) => `(${r},${c})`).join(', ') || '—'}]
            </strong>
          </div>
          {step.found && (
            <div style={{ color: '#2e7d32', marginTop: 6, fontWeight: 'bold' }}>
              Цель найдена! Минимальный путь: {step.path.length - 1} шагов
              <br />
              <span style={{ fontWeight: 'normal', fontSize: 13 }}>
                {step.path.map(([r, c]) => `(${r},${c})`).join(' → ')}
              </span>
            </div>
          )}
          {!step.found && isLast && (
            <div style={{ color: '#c62828', marginTop: 6, fontWeight: 'bold' }}>
              Очередь пуста — путь недостижим. Результат: -1
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setStepIdx(0); setPlaying(true) }}
          disabled={steps.length === 0}
          style={{ background: steps.length === 0 ? '#ccc' : '#16a34a' }}
        >
          ▶ Запустить BFS
        </button>

        {stepIdx !== null && (
          <>
            <button onClick={() => { setPlaying(false); setStepIdx(0) }}                              disabled={stepIdx === 0}>⏮</button>
            <button onClick={() => setStepIdx(i => Math.max(0, (i ?? 0) - 1))}                       disabled={stepIdx === 0}>←</button>
            <button onClick={() => setPlaying(p => !p)}                                               disabled={isLast}>{playing ? '⏸ Пауза' : '▶ Авто'}</button>
            <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, (i ?? 0) + 1))}        disabled={isLast}>→</button>
            <button onClick={() => { setPlaying(false); setStepIdx(steps.length - 1) }}              disabled={isLast}>⏭</button>
            <button onClick={() => { setStepIdx(null); setPlaying(false) }}>✕ Сбросить</button>
          </>
        )}
      </div>
    </div>
  )
}
