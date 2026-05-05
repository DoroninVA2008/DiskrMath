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

  let startRow = -1
  let startCol = -1
  for (let r = 0; r < n && startRow === -1; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 1) {
        startRow = r
        startCol = c
        break
      }
    }
  }

  if (startRow === -1) return { length: 0, log: 'Островов нет' }

  const firstIsland: Cell[] = []
  const queue: Cell[] = [[startRow, startCol]]
  matrix[startRow][startCol] = 2

  while (queue.length > 0) {
    const [row, col] = queue.shift()!
    firstIsland.push([row, col])
    for (const [dRow, dCol] of dirs) {
      const nextRow = row + dRow
      const nextCol = col + dCol
      if (nextRow >= 0 && nextRow < n && nextCol >= 0 && nextCol < n && matrix[nextRow][nextCol] === 1) {
        matrix[nextRow][nextCol] = 2
        queue.push([nextRow, nextCol])
      }
    }
  }

  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(-1))
  const bridgeQueue: Cell[] = []

  for (const [row, col] of firstIsland) {
    for (const [dRow, dCol] of dirs) {
      const nextRow = row + dRow
      const nextCol = col + dCol
      const inBounds = nextRow >= 0 && nextRow < n && nextCol >= 0 && nextCol < n
      if (inBounds && matrix[nextRow][nextCol] === 0 && dist[nextRow][nextCol] === -1) {
        dist[nextRow][nextCol] = 1
        bridgeQueue.push([nextRow, nextCol])
      }
    }
  }

  while (bridgeQueue.length > 0) {
    const [row, col] = bridgeQueue.shift()!
    if (matrix[row][col] === 1) {
      return { length: dist[row][col], log: `Второй остров найден в (${row}, ${col}), длина моста = ${dist[row][col]}` }
    }
    for (const [dRow, dCol] of dirs) {
      const nextRow = row + dRow
      const nextCol = col + dCol
      const inBounds = nextRow >= 0 && nextRow < n && nextCol >= 0 && nextCol < n
      if (inBounds && matrix[nextRow][nextCol] !== 2 && dist[nextRow][nextCol] === -1) {
        dist[nextRow][nextCol] = dist[row][col] + 1
        bridgeQueue.push([nextRow, nextCol])
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
