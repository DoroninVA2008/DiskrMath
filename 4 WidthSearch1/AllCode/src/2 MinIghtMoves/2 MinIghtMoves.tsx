import { useState, useEffect, useRef } from 'react'

type Pos = [number, number]
type EditMode = 'start' | 'end'

const SIZE = 8
const CELL = 58

const KNIGHT: Pos[] = [
  [-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1],
]

interface BFSStep {
  current: Pos
  queue: Pos[]
  distMap: number[][]
  found: boolean
  path: Pos[]
}

function buildSteps(start: Pos, end: Pos): BFSStep[] {
  const [startRow, startCol] = start
  const [endRow, endCol] = end
  const steps: BFSStep[] = []
  const distMap: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(-1))
  const parent: (Pos | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  distMap[startRow][startCol] = 0

  if (startRow === endRow && startCol === endCol) {
    steps.push({
      current: [startRow, startCol],
      queue: [],
      distMap: distMap.map(r => [...r]),
      found: true,
      path: [[startRow, startCol]],
    })
    return steps
  }

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

    for (const [dRow, dCol] of KNIGHT) {
      const nextRow = row + dRow
      const nextCol = col + dCol
      const inBounds = nextRow >= 0 && nextRow < SIZE && nextCol >= 0 && nextCol < SIZE
      if (inBounds && distMap[nextRow][nextCol] === -1) {
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

export default function MinKnightMoves() {
  const [start, setStart] = useState<Pos>([0, 0])
  const [end, setEnd] = useState<Pos>([7, 7])
  const [mode, setMode] = useState<EditMode>('start')
  const [stepIdx, setStepIdx] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const steps = buildSteps(start, end)
  const step = stepIdx !== null ? steps[stepIdx] : null
  const isLast = stepIdx !== null && stepIdx >= steps.length - 1

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= steps.length - 1) { setPlaying(false); return i }
          return i + 1
        })
      }, 300)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, steps.length])

  function handleCell(r: number, c: number) {
    if (mode === 'start') setStart([r, c])
    else setEnd([r, c])
    setStepIdx(null)
    setPlaying(false)
  }

  function reset() {
    setStart([0, 0])
    setEnd([7, 7])
    setStepIdx(null)
    setPlaying(false)
  }

  const knightReach = new Set(
    KNIGHT
      .map(([dRow, dCol]) => [start[0] + dRow, start[1] + dCol])
      .filter(([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE)
      .map(([r, c]) => `${r},${c}`)
  )

  function getCellInfo(r: number, c: number) {
    const isS = r === start[0] && c === start[1]
    const isE = r === end[0] && c === end[1]
    const isLight = (r + c) % 2 === 0
    const chessBg = isLight ? '#f0d9b5' : '#b58863'

    if (!step) {
      if (isS) return { bg: '#1a73e8', label: '♞', tc: '#fff', outline: false }
      if (isE) return { bg: '#16a34a', label: '⚑', tc: '#fff', outline: false }
      const reach = !isS && knightReach.has(`${r},${c}`)
      return { bg: chessBg, label: '', tc: '', outline: reach }
    }

    const dist = step.distMap[r][c]
    const inPath = step.path.some(([pr, pc]) => pr === r && pc === c)
    const isCur = step.current[0] === r && step.current[1] === c
    const inQueue = step.queue.some(([qr, qc]) => qr === r && qc === c)
    const icon = isS ? '♞' : isE ? '⚑' : ''
    const label = icon || (dist >= 0 ? String(dist) : '')

    if (inPath)  return { bg: '#fbbf24', label, tc: '#1e293b', outline: false }
    if (isCur)   return { bg: '#f97316', label, tc: '#fff',    outline: false }
    if (inQueue) return { bg: '#818cf8', label, tc: '#fff',    outline: false }
    if (dist >= 0) return { bg: '#90caf9', label, tc: '#1e293b', outline: false }
    if (isS) return { bg: '#1a73e8', label: '♞', tc: '#fff', outline: false }
    if (isE) return { bg: '#16a34a', label: '⚑', tc: '#fff', outline: false }
    return { bg: chessBg, label: '', tc: '', outline: false }
  }

  const lastStep = steps.at(-1)
  const answer = lastStep?.found ? lastStep.path.length - 1 : '—'

  return (
    <div style={{ padding: 20, maxWidth: 680, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ marginBottom: 4 }}>2. Минимальные ходы коня</h2>
      <p style={{ color: '#555', margin: '0 0 16px', fontSize: 14 }}>
        Доска 8×8. Найти минимум ходов конём (♞) из{' '}
        <span style={{ color: '#1a73e8' }}>старта</span> до{' '}
        <span style={{ color: '#16a34a' }}>цели ⚑</span>.
        Ход коня: Г-образно (±1,±2) или (±2,±1).
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#555' }}>Клик по доске:</span>
        {(['start', 'end'] as EditMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 12px', fontSize: 13,
            border: mode === m ? '2px solid #1a73e8' : '1px solid #ccc',
            background: mode === m ? '#e3f2fd' : '#fff',
            color: m === 'start' ? '#1a73e8' : '#16a34a',
            borderRadius: 6, cursor: 'pointer',
          }}>
            {m === 'start' ? '♞ Поставить коня' : '⚑ Поставить цель'}
          </button>
        ))}
        <button onClick={reset}>↩ Сброс</button>
      </div>

      <div style={{ display: 'inline-block', border: '2px solid #ccc', borderRadius: 4, background: '#e2e8f0' }}>
        <div style={{ display: 'flex', paddingLeft: 24 }}>
          {Array.from({ length: SIZE }, (_, c) => (
            <div key={c} style={{ width: CELL, textAlign: 'center', fontSize: 11, color: '#555', padding: '4px 0 2px' }}>{c}</div>
          ))}
        </div>
        {Array.from({ length: SIZE }, (_, r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 24, textAlign: 'center', fontSize: 11, color: '#555', flexShrink: 0 }}>{r}</div>
            {Array.from({ length: SIZE }, (_, c) => {
              const { bg, label, tc, outline } = getCellInfo(r, c)
              const isIcon = label === '♞' || label === '⚑'
              return (
                <div
                  key={c}
                  onClick={() => handleCell(r, c)}
                  style={{
                    width: CELL, height: CELL, background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isIcon ? 24 : 13, fontWeight: 'bold', color: tc,
                    cursor: 'pointer', userSelect: 'none', transition: 'background 0.12s',
                    outline: outline ? '3px dashed #1a73e8' : 'none',
                    outlineOffset: '-3px',
                  }}
                >
                  {label}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { bg: '#1a73e8', label: '♞ Конь (старт)' },
          { bg: '#16a34a', label: '⚑ Цель' },
          { bg: '#f97316', label: 'Текущий' },
          { bg: '#818cf8', label: 'В очереди' },
          { bg: '#90caf9', label: 'Посещён' },
          { bg: '#fbbf24', label: 'Кратчайший путь' },
        ].map(({ bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: bg, flexShrink: 0 }} />
            <span style={{ color: '#555' }}>{label}</span>
          </div>
        ))}
      </div>

      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#f8f9fa', border: '1px solid #dde3ea', borderRadius: 8, fontSize: 14 }}>
          <span style={{ color: '#555' }}>
            ({start[0]},{start[1]}) → ({end[0]},{end[1]}) — минимум ходов:{' '}
          </span>
          <strong style={{ color: '#2e7d32', fontSize: 20 }}>{answer}</strong>
        </div>
      )}

      {step && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#f8f9fa', border: '1px solid #dde3ea', borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: '#555' }}>
            Шаг <strong>{stepIdx! + 1}</strong> из {steps.length}
          </div>
          <div>
            Текущая клетка:{' '}
            <strong style={{ color: '#f97316' }}>({step.current[0]}, {step.current[1]})</strong>
            {' '}— ход №<strong>{step.distMap[step.current[0]][step.current[1]]}</strong>
          </div>
          <div>
            Очередь:{' '}
            <strong style={{ color: '#818cf8', fontSize: 12 }}>
              [{step.queue.slice(0, 10).map(([r,c]) => `(${r},${c})`).join(', ')}
              {step.queue.length > 10 ? ` …+${step.queue.length - 10}` : ''}]
            </strong>
          </div>
          {step.found && (
            <div style={{ color: '#2e7d32', marginTop: 6, fontWeight: 'bold' }}>
              Цель достигнута! Минимум ходов: {step.path.length - 1}
              <br />
              <span style={{ fontWeight: 'normal', fontSize: 12 }}>
                {step.path.map(([r,c]) => `(${r},${c})`).join(' → ')}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setStepIdx(0); setPlaying(true) }}
          style={{ background: '#16a34a' }}
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
