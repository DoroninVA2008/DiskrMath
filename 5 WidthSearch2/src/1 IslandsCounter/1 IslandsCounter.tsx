import { useState } from 'react'

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

function countIslands(grid: number[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const visited = grid.map(row => row.map(() => false))
  let count = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1 && !visited[r][c]) {
        count++
        const stack: [number, number][] = [[r, c]]
        visited[r][c] = true
        while (stack.length > 0) {
          const [cr, cc] = stack.pop()!
          for (const [dr, dc] of dirs) {
            const nr = cr + dr, nc = cc + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !visited[nr][nc]) {
              visited[nr][nc] = true
              stack.push([nr, nc])
            }
          }
        }
      }
    }
  }

  return count
}

export default function IslandsCounter() {
  const [grid, setGrid] = useState<number[][]>(defgrid.map(r => [...r]))
  const [result, setResult] = useState<number | null>(null)

  function toggleCell(r: number, c: number) {
    setGrid(prev => prev.map((row, i) =>
      row.map((cell, j) => i === r && j === c ? (cell === 1 ? 0 : 1) : cell)
    ))
    setResult(null)
  }

  function reset() {
    setGrid(defgrid.map(r => [...r]))
    setResult(null)
  }

  function clear() {
    setGrid(grid.map(row => row.map(() => 0)))
    setResult(null)
  }

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>1. Острова (компоненты связности)</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Бинарная матрица: <strong>1</strong> — земля, <strong>0</strong> — вода.
        Найти количество островов (групп единиц, связанных по горизонтали/вертикали).
        Кликните на клетку чтобы переключить.
      </p>

      <div style={{ marginBottom: 20 }}>
        <table style={{ borderCollapse: 'collapse', background: '#f1f5f9' }}>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} style={{ padding: 3 }}>
                    <div
                      onClick={() => toggleCell(r, c)}
                      style={{
                        width: 54, height: 54, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 'bold', cursor: 'pointer',
                        borderRadius: 6, userSelect: 'none',
                        backgroundColor: cell === 1 ? '#16a34a' : '#cbd5e1',
                        color: '#fff', transition: 'background 0.15s',
                      }}
                    >
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setResult(countIslands(grid))}>Подсчитать острова</button>
        <button onClick={reset} style={{ background: '#f97316' }}>↩ Сброс</button>
        <button onClick={clear} style={{ background: '#f44336' }}>Очистить</button>
      </div>

      {result !== null && (
        <div style={{
          padding: '12px 16px', borderRadius: 6,
          backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50',
          fontSize: 16, fontWeight: 'bold',
        }}>
          Количество островов: <strong style={{ fontSize: 22 }}>{result}</strong>
        </div>
      )}
    </div>
  )
}
