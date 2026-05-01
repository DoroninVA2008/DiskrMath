import { useState } from 'react'

type Pos = { row: number; col: number }

const dirs: Pos[] = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }]

const defgrid: string[][] = [
  ['S', '0', '1', 'E'],
  ['1', '0', '1', '0'],
  ['1', '0', '0', 'S'],
]

function findEvacuationTime(grid: string[][]): { time: number; dist: number[][]; error: string } {
  const rows = grid.length
  const cols = grid[0].length
  let exit: Pos | null = null
  const people: Pos[] = []

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 'E') exit = { row: r, col: c }
      if (grid[r][c] === 'S') people.push({ row: r, col: c })
    }

  if (!exit) return { time: -1, dist: [], error: 'Выход E не найден!' }
  if (people.length === 0) return { time: -1, dist: [], error: 'Люди S не найдены!' }

  const dist: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1))
  const queue: Pos[] = [exit]
  dist[exit.row][exit.col] = 0

  while (queue.length > 0) {
    const { row, col } = queue.shift()!
    for (const { row: dr, col: dc } of dirs) {
      const nr = row + dr, nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== '1' && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[row][col] + 1
        queue.push({ row: nr, col: nc })
      }
    }
  }

  let maxTime = 0
  for (const { row, col } of people) {
    if (dist[row][col] === -1)
      return { time: -1, dist, error: `Человек на (${row}, ${col}) не может достичь выхода!` }
    maxTime = Math.max(maxTime, dist[row][col])
  }

  return { time: maxTime, dist, error: '' }
}

function cellColor(cell: string): string {
  if (cell === 'E') return '#16a34a'
  if (cell === 'S') return '#f97316'
  if (cell === '1') return '#374151'
  return '#f1f5f9'
}

export default function RoomEvacuation() {
  const [grid, setGrid] = useState<string[][]>(defgrid.map(r => [...r]))
  const [result, setResult] = useState<{ time: number; dist: number[][]; error: string } | null>(null)

  function updateCell(r: number, c: number, val: string) {
    setGrid(prev => prev.map((row, i) => row.map((cell, j) => i === r && j === c ? val : cell)))
    setResult(null)
  }

  function reset() {
    setGrid(defgrid.map(r => [...r]))
    setResult(null)
  }

  return (
    <div style={{ padding: 20, maxWidth: 540, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>4. Эвакуация из комнат</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        <strong>E</strong> — выход, <strong>0</strong> — проход, <strong>1</strong> — стена,
        <strong> S</strong> — человек. Найти минимальное время эвакуации всех людей (макс. из кратчайших расстояний до выхода).
      </p>

      <div style={{ display: 'inline-block', background: '#e2e8f0', padding: 10, borderRadius: 10, marginBottom: 16 }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
            {row.map((cell, c) => {
              const dist = result?.dist[r]?.[c]
              return (
                <div key={c} style={{ position: 'relative' }}>
                  <select
                    value={cell}
                    onChange={e => updateCell(r, c, e.target.value)}
                    style={{
                      width: 54, height: 54, textAlign: 'center', fontWeight: 'bold',
                      fontSize: 16, borderRadius: 6, border: '1px solid #ccc',
                      cursor: 'pointer', backgroundColor: cellColor(cell),
                      color: cell === '1' ? '#9ca3af' : cell === '0' ? '#333' : '#fff',
                    }}
                  >
                    <option value="S">S</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="E">E</option>
                  </select>
                  {dist !== undefined && dist !== -1 && cell === '0' && (
                    <span style={{
                      position: 'absolute', bottom: 2, right: 4,
                      fontSize: 10, color: '#1a73e8', fontWeight: 'bold',
                    }}>{dist}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setResult(findEvacuationTime(grid))}>Рассчитать эвакуацию</button>
        <button onClick={reset} style={{ background: '#6b7280' }}>↩ Сброс</button>
      </div>

      {result && result.error && (
        <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#fdecea', borderLeft: '4px solid #f44336' }}>
          ⚠️ {result.error}
        </div>
      )}

      {result && !result.error && (
        <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
          Минимальное время эвакуации:{' '}
          <strong style={{ fontSize: 22, color: '#2e7d32' }}>{result.time}</strong> шагов
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#555' }}>
            Цифры на клетках — расстояние до выхода.
          </p>
        </div>
      )}
    </div>
  )
}
