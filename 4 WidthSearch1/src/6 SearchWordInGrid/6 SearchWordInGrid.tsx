import { useState } from 'react'

const INITIAL_GRID: string[][] = [
  ['A', 'B', 'C', 'E'],
  ['S', 'F', 'C', 'S'],
  ['A', 'D', 'E', 'E'],
]

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function findWord(board: string[][], word: string): [number, number][] {
  const rows = board.length
  const cols = board[0].length
  const visited = board.map(row => row.map(() => false))

  function dfs(r: number, c: number, idx: number, path: [number, number][]): boolean {
    if (idx === word.length) return true
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false
    if (visited[r][c] || board[r][c] !== word[idx]) return false

    visited[r][c] = true
    path.push([r, c])

    for (const [dr, dc] of DIRS) {
      if (dfs(r + dr, c + dc, idx + 1, path)) return true
    }

    path.pop()
    visited[r][c] = false
    return false
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const path: [number, number][] = []
      if (dfs(r, c, 0, path)) return path
    }
  }

  return []
}

export default function WordSearch() {
  const [grid, setGrid] = useState<string[][]>(INITIAL_GRID.map(r => [...r]))
  const [word, setWord] = useState('ABCCED')
  const [path, setPath] = useState<[number, number][] | null>(null)

  const handleCheck = () => setPath(findWord(grid, word))

  const handleCell = (r: number, c: number, val: string) => {
    const next = grid.map(row => [...row])
    next[r][c] = val.toUpperCase().slice(-1) || next[r][c]
    setGrid(next)
    setPath(null)
  }

  const isOnPath = (r: number, c: number) =>
    path?.some(([pr, pc]) => pr === r && pc === c) ?? false

  const found = path !== null && path.length > 0

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>6. Поиск слова в сетке (DFS + Backtracking)</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Двигаемся по 4 сторонам без повторного использования клеток.
      </p>

      <h3 style={{ marginBottom: 8 }}>Сетка {grid.length}×{grid[0].length}</h3>
      <table style={{ borderCollapse: 'collapse', marginBottom: 20 }}>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <input
                    type="text"
                    maxLength={1}
                    value={cell}
                    onChange={e => handleCell(r, c, e.target.value)}
                    style={{
                      width: 50, height: 50, textAlign: 'center',
                      fontSize: 20, fontWeight: 'bold', margin: 2,
                      border: isOnPath(r, c) ? '3px solid #1a73e8' : '1px solid #ccc',
                      backgroundColor: isOnPath(r, c) ? '#e3f2fd' : '#fff',
                      borderRadius: 6, cursor: 'text',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Слово:</label>
        <input
          type="text"
          value={word}
          onChange={e => { setWord(e.target.value.toUpperCase()); setPath(null) }}
          style={{ padding: '6px 10px', fontSize: 15, width: 200, border: '1px solid #ccc', borderRadius: 4 }}
        />
      </div>

      <button onClick={handleCheck}>Найти слово</button>

      {path !== null && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 6,
          backgroundColor: found ? '#e8f5e9' : '#fdecea',
          borderLeft: `4px solid ${found ? '#4caf50' : '#f44336'}`,
        }}>
          <strong>
            {found
              ? `Слово "${word}" найдено! Маршрут: ${path.map(([r, c]) => `(${r},${c})`).join(' → ')}`
              : `Слово "${word}" не найдено`}
          </strong>
        </div>
      )}
    </div>
  )
}
