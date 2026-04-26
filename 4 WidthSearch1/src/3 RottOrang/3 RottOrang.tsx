import { useState, useEffect, useRef } from 'react'

type CellVal = 0 | 1 | 2
type DrawMode = 0 | 1 | 2

const DIRS: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]]

function computeBFS(grid: CellVal[][]): { time: number; distMap: number[][] } {
  const R = grid.length
  const C = grid[0]?.length ?? 0
  const distMap: number[][] = Array.from({ length: R }, () => Array(C).fill(-1))
  const queue: [number, number][] = []

  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === 2) { distMap[r][c] = 0; queue.push([r, c]) }

  let head = 0
  while (head < queue.length) {
    const [r, c] = queue[head++]
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 1 && distMap[nr][nc] === -1) {
        distMap[nr][nc] = distMap[r][c] + 1
        queue.push([nr, nc])
      }
    }
  }

  let time = 0
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === 1) {
        if (distMap[r][c] === -1) return { time: -1, distMap }
        time = Math.max(time, distMap[r][c])
      }

  return { time, distMap }
}

const DEFAULT: CellVal[][] = [[2,1,1],[1,1,0],[0,1,1]]

function cellSize(maxDim: number) { return maxDim <= 4 ? 62 : maxDim <= 6 ? 52 : 44 }

export default function RottOrang() {
  const [grid, setGrid] = useState<CellVal[][]>(DEFAULT)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [mode, setMode] = useState<DrawMode>(2)
  const [stepIdx, setStepIdx] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { time, distMap } = computeBFS(grid)
  const maxMinute = time === -1 ? Math.max(0, ...distMap.flat()) : time
  const totalSteps = maxMinute + 1
  const isLast = stepIdx !== null && stepIdx >= totalSteps - 1

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= totalSteps - 1) { setPlaying(false); return i }
          return i + 1
        })
      }, 700)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, totalSteps])

  function changeSize(newR: number, newC: number) {
    setGrid(prev => Array.from({ length: newR }, (_, r) =>
      Array.from({ length: newC }, (_, c) =>
        r < prev.length && c < (prev[0]?.length ?? 0) ? prev[r][c] : 0
      ) as CellVal[]
    ))
    setRows(newR); setCols(newC)
    setStepIdx(null); setPlaying(false)
  }

  function handleCell(r: number, c: number) {
    setGrid(prev => prev.map((row, ri) =>
      row.map((cell, ci) => ri === r && ci === c ? mode as CellVal : cell)
    ))
    setStepIdx(null); setPlaying(false)
  }

  function reset() {
    setGrid(DEFAULT); setRows(3); setCols(3)
    setStepIdx(null); setPlaying(false)
  }

  function getCellInfo(r: number, c: number) {
    const val = grid[r][c]
    const dist = distMap[r][c]
    const t = stepIdx

    if (val === 0) return { bg: '#e2e8f0', emoji: '·', sub: '', glow: false }

    if (t === null) {
      if (val === 1) return { bg: '#bbf7d0', emoji: '🍊', sub: dist >= 0 ? String(dist) : '?', glow: false }
      return { bg: '#fed7aa', emoji: '🤢', sub: '0', glow: false }
    }

    if (val === 2) return { bg: '#fed7aa', emoji: '🤢', sub: '0', glow: false }
    if (dist === -1) return { bg: '#bbf7d0', emoji: '🍊', sub: '✗', glow: false }

    if (dist <= t) {
      const isNew = dist === t
      return { bg: isNew ? '#fca5a5' : '#fdba74', emoji: '🤢', sub: String(dist), glow: isNew }
    }

    return { bg: '#bbf7d0', emoji: '🍊', sub: String(dist), glow: false }
  }

  const freshLeft = stepIdx !== null
    ? grid.reduce((total, row, r) =>
        total + row.reduce((cnt, val, c) => {
          if (val !== 1) return cnt
          const d = distMap[r][c]
          return cnt + (d === -1 || d > stepIdx ? 1 : 0)
        }, 0), 0)
    : null

  const cs = cellSize(Math.max(rows, cols))

  const selectStyle: React.CSSProperties = {
    padding: '3px 6px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, background: '#fff',
  }

  return (
    <div style={{ padding: 20, maxWidth: 640, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ marginBottom: 4 }}>3. Гнилые апельсины</h2>
      <p style={{ color: '#555', margin: '0 0 16px', fontSize: 14 }}>
        <strong>0</strong> — пусто · <strong>🍊</strong> — свежий · <strong>🤢</strong> — гнилой.
        Каждую минуту гнилые заражают соседей. Найти время полного заражения, иначе{' '}
        <strong style={{ color: '#f44336' }}>-1</strong>.
        <span style={{ color: '#888' }}> Цифра в клетке = минута заражения.</span>
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <label style={{ fontSize: 13 }}>
          Строк:&nbsp;
          <select value={rows} onChange={e => changeSize(Number(e.target.value), cols)} style={selectStyle}>
            {[2,3,4,5,6,7].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Столбцов:&nbsp;
          <select value={cols} onChange={e => changeSize(rows, Number(e.target.value))} style={selectStyle}>
            {[2,3,4,5,6,7].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        {([0, 1, 2] as DrawMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 11px', fontSize: 13,
            border: mode === m ? '2px solid #1a73e8' : '1px solid #ccc',
            background: mode === m ? '#e3f2fd' : '#fff',
            color: '#333', borderRadius: 6, cursor: 'pointer',
          }}>
            {m === 0 ? '⬜ Пусто' : m === 1 ? '🍊 Свежий' : '🤢 Гнилой'}
          </button>
        ))}

        <button onClick={reset}>↩ Сброс</button>
      </div>

      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${cols}, ${cs}px)`,
        gap: 4, background: '#e2e8f0', padding: 10, borderRadius: 10,
      }}>
        {grid.map((row, r) => row.map((_, c) => {
          const { bg, emoji, sub, glow } = getCellInfo(r, c)
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCell(r, c)}
              style={{
                width: cs, height: cs, background: bg, borderRadius: 8,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s',
                fontSize: cs > 55 ? 26 : 22,
                boxShadow: glow ? '0 0 10px #ef4444' : 'none',
                outline: glow ? '2px solid #ef4444' : 'none',
              }}
            >
              {emoji}
              {sub && (
                <span style={{ fontSize: 10, lineHeight: 1, marginTop: -2, color: '#555' }}>
                  {sub}
                </span>
              )}
            </div>
          )
        }))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { bg: '#e2e8f0', label: '⬜ Пусто' },
          { bg: '#bbf7d0', label: '🍊 Свежий' },
          { bg: '#fed7aa', label: '🤢 Гнилой' },
          { bg: '#fca5a5', label: '🤢 Только что сгнил' },
        ].map(({ bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: bg, border: '1px solid #ccc', flexShrink: 0 }} />
            <span style={{ color: '#555' }}>{label}</span>
          </div>
        ))}
      </div>

      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#f8f9fa', border: '1px solid #dde3ea', borderRadius: 8, fontSize: 14 }}>
          {time === -1
            ? <span style={{ color: '#c62828' }}>Часть апельсинов недостижима → <strong>-1</strong></span>
            : <span>Все сгниют за: <strong style={{ color: '#2e7d32', fontSize: 20 }}>{time}</strong> мин.</span>
          }
        </div>
      )}

      {stepIdx !== null && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#f8f9fa', border: '1px solid #dde3ea', borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}>
          <div>
            Минута <strong style={{ fontSize: 20 }}>{stepIdx}</strong> / {maxMinute}
          </div>
          <div>
            Свежих осталось: <strong style={{ color: freshLeft === 0 ? '#2e7d32' : '#f97316' }}>{freshLeft}</strong>
          </div>
          {isLast && time !== -1 && (
            <div style={{ color: '#2e7d32', fontWeight: 'bold', marginTop: 4 }}>
              Все апельсины сгнили! Ответ: {time} мин.
            </div>
          )}
          {isLast && time === -1 && (
            <div style={{ color: '#c62828', fontWeight: 'bold', marginTop: 4 }}>
              Осталось {freshLeft} недостижимых 🍊 → результат: -1
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => { setStepIdx(0); setPlaying(true) }} style={{ background: '#16a34a' }}>
          ▶ Запустить BFS
        </button>

        {stepIdx !== null && (
          <>
            <button onClick={() => { setPlaying(false); setStepIdx(0) }}                              disabled={stepIdx === 0}>⏮</button>
            <button onClick={() => setStepIdx(i => Math.max(0, (i ?? 0) - 1))}                       disabled={stepIdx === 0}>←</button>
            <button onClick={() => setPlaying(p => !p)}                                               disabled={isLast}>{playing ? '⏸ Пауза' : '▶ Авто'}</button>
            <button onClick={() => setStepIdx(i => Math.min(totalSteps - 1, (i ?? 0) + 1))}          disabled={isLast}>→</button>
            <button onClick={() => { setPlaying(false); setStepIdx(totalSteps - 1) }}                 disabled={isLast}>⏭</button>
            <button onClick={() => { setStepIdx(null); setPlaying(false) }}>✕ Сбросить</button>
          </>
        )}
      </div>
    </div>
  )
}
