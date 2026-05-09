import { useState } from 'react'

type Pos = { row: number; col: number }

const MAZE = [
  [1, 0, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
]

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

function findNearestExit(maze: number[][], start: Pos): { steps: number; exit: Pos | null } {
  const rows = maze.length
  const cols = maze[0].length

  const isExit = (r: number, c: number) =>
    r === 0 || r === rows - 1 || c === 0 || c === cols - 1

  if (isExit(start.row, start.col)) return { steps: 0, exit: start }

  const visited = maze.map(row => row.map(() => false))
  visited[start.row][start.col] = true

  const queue: { pos: Pos; dist: number }[] = [{ pos: start, dist: 0 }]

  while (queue.length > 0) {
    const { pos, dist } = queue.shift()!

    for (const [dRow, dCol] of DIRS) {
      const nextRow = pos.row + dRow
      const nextCol = pos.col + dCol
      const inBounds = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols

      if (inBounds && maze[nextRow][nextCol] === 0 && !visited[nextRow][nextCol]) {
        if (isExit(nextRow, nextCol)) return { steps: dist + 1, exit: { row: nextRow, col: nextCol } }
        visited[nextRow][nextCol] = true
        queue.push({ pos: { row: nextRow, col: nextCol }, dist: dist + 1 })
      }
    }
  }

  return { steps: -1, exit: null }
}

export default function MazeSolver() {
  const [start, setStart] = useState<Pos>({ row: 1, col: 1 })
  const [result, setResult] = useState<{ steps: number; exit: Pos | null } | null>(null)

  const handleSolve = () => setResult(findNearestExit(MAZE, start))

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>5. Ближайший выход из лабиринта</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        <strong>0</strong> — проход, <strong>1</strong> — стена. Найти минимум шагов до любой
        граничной клетки (выхода).
      </p>

      <div style={{ display: 'inline-block', marginBottom: 20 }}>
        {MAZE.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => {
              const isStart = start.row === r && start.col === c
              const isExit  = result?.exit?.row === r && result?.exit?.col === c
              const bg = cell === 1 ? '#374151' : isStart ? '#1a73e8' : isExit ? '#f97316' : '#f1f5f9'
              return (
                <div
                  key={c}
                  style={{
                    width: 54, height: 54, border: '1px solid #ccc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: bg, fontWeight: 'bold', fontSize: 22, color: '#fff',
                  }}
                >
                  {cell === 1 ? '🧱' : isStart ? 'S' : isExit ? '🚪' : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Старт (строка, столбец):&nbsp;
          <input
            type="number" value={start.row}
            onChange={e => { setStart({ ...start, row: +e.target.value }); setResult(null) }}
            style={{ width: 55, marginRight: 8, padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
          />
          <input
            type="number" value={start.col}
            onChange={e => { setStart({ ...start, col: +e.target.value }); setResult(null) }}
            style={{ width: 55, padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </label>
        <button onClick={handleSolve} style={{ marginLeft: 16 }}>Найти выход</button>
      </div>

      {result && (
        <div style={{
          padding: '12px 16px', borderRadius: 6,
          backgroundColor: result.steps !== -1 ? '#e8f5e9' : '#fdecea',
          borderLeft: `4px solid ${result.steps !== -1 ? '#4caf50' : '#f44336'}`,
        }}>
          {result.steps !== -1 ? (
            <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold', fontSize: 16 }}>
              Минимум шагов: {result.steps} — выход в ({result.exit!.row}, {result.exit!.col})
            </p>
          ) : (
            <p style={{ margin: 0, color: '#c62828', fontWeight: 'bold', fontSize: 16 }}>
              Выход не найден → -1
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 13, color: '#666' }}>
        <strong>Пример:</strong>{' '}
        <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
          start=(1,1) → 2 шага
        </code>
      </div>
    </div>
  )
}
