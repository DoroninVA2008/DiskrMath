import { useState } from 'react'

const Start = '0000'
const Target = '0202'
const ForBiden = '0001, 0101'

function getNeighbors(code: string): string[] {
  const digits = code.split('').map(Number)
  const result: string[] = []
  for (let i = 0; i < 4; i++) {
    const forward = [...digits]
    forward[i] = (digits[i] + 1) % 10

    const backward = [...digits]
    backward[i] = (digits[i] - 1 + 10) % 10

    result.push(forward.join(''), backward.join(''))
  }
  return result
}

function findMinRotations(
  start: string,
  target: string,
  forbidden: Set<string>
): { steps: number; path: string[] } | null {
  if (start === target) return { steps: 0, path: [start] }
  if (forbidden.has(start)) return null

  const queue: { code: string; path: string[] }[] = [{ code: start, path: [start] }]
  const visited = new Set([start])

  while (queue.length > 0) {
    const { code, path } = queue.shift()!
    for (const neighbor of getNeighbors(code)) {
      if (!visited.has(neighbor) && !forbidden.has(neighbor)) {
        const newPath = [...path, neighbor]
        if (neighbor === target) return { steps: newPath.length - 1, path: newPath }
        visited.add(neighbor)
        queue.push({ code: neighbor, path: newPath })
      }
    }
  }

  return null
}

export default function RotatingLocks() {
  const [start, setStart] = useState(Start)
  const [target, setTarget] = useState(Target)
  const [forbiddenInput, setForbiddenInput] = useState(ForBiden)
  const [result, setResult] = useState<{ steps: number; path: string[] } | null | false>(undefined as any)
  const [solved, setSolved] = useState(false)

  function handleSolve() {
    if (!/^\d{4}$/.test(start) || !/^\d{4}$/.test(target)) {
      alert('Старт и цель должны быть 4-значными числами')
      return
    }
    const forbidden = new Set(
      forbiddenInput.split(/[\s,]+/).filter(f => /^\d{4}$/.test(f))
    )
    const res = findMinRotations(start, target, forbidden)
    setResult(res)
    setSolved(true)
  }

  function reset() {
    setStart(Start)
    setTarget(Target)
    setForbiddenInput(ForBiden)
    setSolved(false)
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6,
    fontSize: 15, fontFamily: 'monospace', width: '100%',
  }

  return (
    <div style={{ padding: 20, maxWidth: 580, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>3. Вращающиеся замки</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Код — 4-значное число. За один ход любую цифру можно повернуть на ±1 (0↔9).
        Найти <strong>минимум поворотов</strong> от старта до цели, обходя запрещённые коды.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <label style={{ flex: 1, fontSize: 13 }}>
          Старт:
          <input value={start} onChange={e => setStart(e.target.value)} maxLength={4} style={{ ...inputStyle, marginTop: 4 }} placeholder="0000" />
        </label>
        <label style={{ flex: 1, fontSize: 13 }}>
          Цель:
          <input value={target} onChange={e => setTarget(e.target.value)} maxLength={4} style={{ ...inputStyle, marginTop: 4 }} placeholder="0202" />
        </label>
      </div>

      <label style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
        Запрещённые комбинации (через запятую):
        <input
          value={forbiddenInput}
          onChange={e => setForbiddenInput(e.target.value)}
          style={{ ...inputStyle, marginTop: 4 }}
          placeholder="0001, 0101"
        />
      </label>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={handleSolve}>Найти минимум поворотов</button>
        <button onClick={reset} style={{ background: '#6b7280' }}>↩ Сброс</button>
      </div>

      {solved && result === null && (
        <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#fdecea', borderLeft: '4px solid #f44336' }}>
          <strong>Недостижимо</strong> — цель {target} заблокирована запрещёнными кодами → -1
        </div>
      )}

      {solved && result && (
        <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
          <div style={{ marginBottom: 8 }}>
            Минимум поворотов: <strong style={{ fontSize: 22, color: '#2e7d32' }}>{result.steps}</strong>
          </div>
          <div style={{ marginBottom: 6, fontSize: 13, color: '#555' }}>Кратчайший путь:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontFamily: 'monospace', fontSize: 14 }}>
            {result.path.map((code, i) => (
              <>
                <span
                  key={code + i}
                  style={{
                    padding: '3px 8px', borderRadius: 5, fontWeight: 'bold',
                    backgroundColor: i === 0 ? '#e3f2fd' : i === result.path.length - 1 ? '#c8e6c9' : '#fff',
                    border: '1px solid #ccc',
                  }}
                >
                  {code}
                </span>
                {i < result.path.length - 1 && <span style={{ color: '#999' }}>→</span>}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
