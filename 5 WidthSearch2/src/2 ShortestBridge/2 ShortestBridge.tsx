import { useState } from 'react'

type Cell = [number, number]

const dirs = [ 
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1] 
]

const defgrid = [
  [1, 1, 0, 0],
  [1, 0, 0, 0],
  [0, 0, 1, 1],
  [0, 0, 1, 1],
]

function findShortestBridge(grid: number[][]): { length: number; log: string } {
  const n = grid.length
  const matrix = grid.map(row => [...row])

  let startR = -1, startC = -1
  outer: for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (matrix[r][c] === 1) { startR = r; startC = c; break outer }

  if (startR === -1) return { length: 0, log: 'Островов нет' }

  const firstIsland: Cell[] = []
  const q: Cell[] = [[startR, startC]]
  matrix[startR][startC] = 2

  while (q.length > 0) {
    const [r, c] = q.shift()!
    firstIsland.push([r, c])
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && matrix[nr][nc] === 1) {
        matrix[nr][nc] = 2
        q.push([nr, nc])
      }
    }
  }

  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(-1))
  const bfsQ: Cell[] = []

  for (const [r, c] of firstIsland) {
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && matrix[nr][nc] === 0 && dist[nr][nc] === -1) {
        dist[nr][nc] = 1
        bfsQ.push([nr, nc])
      }
    }
  }

  while (bfsQ.length > 0) {
    const [r, c] = bfsQ.shift()!
    if (matrix[r][c] === 1) {
      return { length: dist[r][c], log: `Второй остров найден в (${r}, ${c}), длина моста = ${dist[r][c]}` }
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && matrix[nr][nc] !== 2 && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1
        bfsQ.push([nr, nc])
      }
    }
  }

  return { length: 0, log: 'Второй остров не найден' }
}

export default function ShortestBridge() {
  const [grid] = useState<number[][]>(defgrid)
  const [result, setResult] = useState<{ length: number; log: string } | null>(null)

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>2. Минимальный мост между островами</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Матрица N×N: два острова (<strong>1</strong>), вода (<strong>0</strong>).
        Найти длину кратчайшего моста — минимум клеток воды, которые нужно превратить в сушу.
      </p>

      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${grid.length}, 48px)`,
        gap: 4, background: '#e2e8f0', padding: 10, borderRadius: 10, marginBottom: 20,
      }}>
        {grid.map((row, r) => row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: 48, height: 48, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 'bold',
              backgroundColor: cell === 1 ? '#1a73e8' : '#f1f5f9',
              color: cell === 1 ? '#fff' : '#333',
            }}
          >
            {cell}
          </div>
        )))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setResult(findShortestBridge(grid))}>Найти кратчайший мост</button>
        <button onClick={() => setResult(null)} style={{ background: '#6b7280' }}>↩ Сброс</button>
      </div>

      {result && (
        <>
          <div style={{
            padding: '12px 16px', borderRadius: 6,
            backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', marginBottom: 12,
          }}>
            <strong>Длина кратчайшего моста: </strong>
            <span style={{ fontSize: 22, fontWeight: 'bold', color: '#2e7d32' }}>{result.length}</span>
          </div>
          <div style={{
            padding: '10px 14px', borderRadius: 6,
            backgroundColor: '#f8f9fa', border: '1px solid #dde3ea', fontSize: 13,
          }}>
            <strong>Лог BFS:</strong> {result.log}
          </div>
        </>
      )}
    </div>
  )
}
