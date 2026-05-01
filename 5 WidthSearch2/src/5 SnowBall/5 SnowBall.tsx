import { useState } from 'react'

interface BFSResult {
  steps: number
  path: number[]
  operations: string[]
}

function findMinOps(n: number): BFSResult | null {
  if (n === 1) return { steps: 0, path: [1], operations: [] }

  const limit = Math.max(n + 10, n * 2)
  const queue: { val: number; path: number[]; ops: string[] }[] = [{ val: 1, path: [1], ops: [] }]
  const visited = new Set([1])

  while (queue.length > 0) {
    const { val, path, ops } = queue.shift()!

    const next = [
      { val: val * 2, op: `×2 → ${val * 2}` },
      { val: val * 3, op: `×3 → ${val * 3}` },
      { val: val + 1, op: `+1 → ${val + 1}` },
    ]

    for (const { val: nv, op } of next) {
      if (nv === n) return { steps: path.length, path: [...path, nv], operations: [...ops, op] }
      if (!visited.has(nv) && nv > 0 && nv <= limit) {
        visited.add(nv)
        queue.push({ val: nv, path: [...path, nv], ops: [...ops, op] })
      }
    }
  }

  return null
}

export default function SnowBall() {
  const [target, setTarget] = useState(10)
  const [result, setResult] = useState<BFSResult | null | undefined>(undefined)

  function handleCalculate() {
    if (target < 1) { alert('N должно быть >= 1'); return }
    setResult(findMinOps(target))
  }

  return (
    <div style={{ padding: 20, maxWidth: 560, margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2>5. Снежный ком</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Начинаем с <strong>X = 1</strong>. За один ход: ×2, ×3 или +1.
        Найти <strong>минимум операций</strong> чтобы получить N.
      </p>
      <p style={{ fontSize: 13, color: '#555', margin: '0 0 16px' }}>
        Пример: N = 10 → 1 →<strong>×3</strong>→ 3 →<strong>×3</strong>→ 9 →<strong>+1</strong>→ 10 = <strong>3 операции</strong>
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13 }}>
          Целевое число N:
          <input
            type="number" min={1} value={target}
            onChange={e => { setTarget(+e.target.value || 1); setResult(undefined) }}
            style={{ display: 'block', marginTop: 4, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 15, width: 120 }}
          />
        </label>
        <button onClick={handleCalculate}>Найти минимум операций</button>
        <button onClick={() => { setTarget(10); setResult(undefined) }} style={{ background: '#6b7280' }}>
          Пример (N=10)
        </button>
      </div>

      {result === null && (
        <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#fdecea', borderLeft: '4px solid #f44336' }}>
          Решение не найдено в разумных пределах
        </div>
      )}

      {result && (
        <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
          <div style={{ marginBottom: 12 }}>
            Операций: <strong style={{ fontSize: 22, color: '#2e7d32' }}>{result.steps}</strong>
          </div>

          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 'bold' }}>Последовательность чисел:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontFamily: 'monospace', marginBottom: 12 }}>
            {result.path.map((val, i) => (
              <>
                <span
                  key={i}
                  style={{
                    padding: '4px 10px', borderRadius: 5, fontWeight: 'bold', fontSize: 14,
                    backgroundColor: i === 0 ? '#e3f2fd' : i === result.path.length - 1 ? '#c8e6c9' : '#fff',
                    border: '1px solid #ccc',
                  }}
                >
                  {val}
                </span>
                {i < result.path.length - 1 && <span style={{ color: '#999' }}>→</span>}
              </>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>Операции:</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, background: '#f1f5f9', padding: '8px 12px', borderRadius: 6 }}>
            {result.operations.map((op, i) => (
              <div key={i}>{i + 1}. {op}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
