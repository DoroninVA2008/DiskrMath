import { useState, useEffect, useRef } from 'react';

type CellVal  = 0 | 1 | 2;  // 0=пусто, 1=свежий, 2=гнилой
type DrawMode = 0 | 1 | 2;

const DIRS: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];

function computeBFS(grid: CellVal[][]): { time: number; distMap: number[][] } {
  const R = grid.length;
  const C = grid[0]?.length ?? 0;
  const distMap: number[][] = Array.from({ length: R }, () => Array(C).fill(-1));
  const queue: [number, number][] = [];

  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === 2) { distMap[r][c] = 0; queue.push([r, c]); }

  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 1 && distMap[nr][nc] === -1) {
        distMap[nr][nc] = distMap[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }

  let time = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === 1) {
        if (distMap[r][c] === -1) return { time: -1, distMap };
        time = Math.max(time, distMap[r][c]);
      }

  return { time, distMap };
}


const DEFAULT: CellVal[][] = [[2,1,1],[1,1,0],[0,1,1]];

function cellSize(maxDim: number) { return maxDim <= 4 ? 62 : maxDim <= 6 ? 52 : 44; }

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 13px', borderRadius: 6, fontSize: 13,
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid #334155',
    background: disabled ? '#1e293b' : '#334155',
    color:      disabled ? '#475569' : '#e2e8f0',
  };
}

export default function RottOrang() {
  const [grid,    setGrid]    = useState<CellVal[][]>(DEFAULT);
  const [rows,    setRows]    = useState(3);
  const [cols,    setCols]    = useState(3);
  const [mode,    setMode]    = useState<DrawMode>(2);
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { time, distMap } = computeBFS(grid);
  const maxMinute  = time === -1 ? Math.max(0, ...distMap.flat()) : time;
  const totalSteps = maxMinute + 1;
  const isLast     = stepIdx !== null && stepIdx >= totalSteps - 1;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= totalSteps - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 700);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, totalSteps]);

  const changeSize = (newR: number, newC: number) => {
    setGrid(prev => Array.from({ length: newR }, (_, r) =>
      Array.from({ length: newC }, (_, c) =>
        r < prev.length && c < (prev[0]?.length ?? 0) ? prev[r][c] : 0
      ) as CellVal[]
    ));
    setRows(newR); setCols(newC);
    setStepIdx(null); setPlaying(false);
  };

  const handleCell = (r: number, c: number) => {
    setGrid(prev => prev.map((row, ri) =>
      row.map((cell, ci) => ri === r && ci === c ? mode as CellVal : cell)
    ));
    setStepIdx(null); setPlaying(false);
  };

  const reset = () => {
    setGrid(DEFAULT); setRows(3); setCols(3);
    setStepIdx(null); setPlaying(false);
  };

  const getCellInfo = (r: number, c: number) => {
    const val  = grid[r][c];
    const t    = stepIdx;
    const dist = distMap[r][c];

    if (val === 0) return { bg: '#1e293b', emoji: '·', sub: '', glow: false, dimSub: true };

    if (t === null) {
      if (val === 1) return { bg: '#166534', emoji: '🍊', sub: dist >= 0 ? String(dist) : '?', glow: false, dimSub: false };
      return              { bg: '#7c2d12', emoji: '🤢', sub: '0',                              glow: false, dimSub: false };
    }

    if (val === 2) return { bg: '#92400e', emoji: '🤢', sub: '0', glow: false, dimSub: false };

    if (dist === -1) return { bg: '#166534', emoji: '🍊', sub: '✗', glow: false, dimSub: false }; // недостижим

    if (dist <= t) {
      const isNew = dist === t;
      return { bg: isNew ? '#dc2626' : '#92400e', emoji: '🤢', sub: String(dist), glow: isNew, dimSub: false };
    }

    return { bg: '#166534', emoji: '🍊', sub: String(dist), glow: false, dimSub: true };
  };

  const freshLeft = stepIdx !== null
    ? grid.reduce((total, row, r) =>
        total + row.reduce((cnt, val, c) => {
          if (val !== 1) return cnt;
          const d = distMap[r][c];
          return cnt + (d === -1 || d > stepIdx ? 1 : 0);
        }, 0), 0)
    : null;

  const cs = cellSize(Math.max(rows, cols));

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 640, margin: '0 auto', color: '#e2e8f0' }}>
      <h2 style={{ marginBottom: 4 }}>3. Гнилые апельсины</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>
        <strong>0</strong> — пусто&nbsp;·&nbsp;<strong>🍊</strong> — свежий&nbsp;·&nbsp;<strong>🤢</strong> — гнилой.
        Каждую минуту гнилые заражают соседей (4 стороны). Найти время полного заражения. Иначе → <strong style={{ color: '#f87171' }}>-1</strong>.
        <br />
        <span style={{ color: '#64748b' }}>Цифра в клетке = минута заражения.</span>
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <label style={{ fontSize: 13 }}>
          Строк:&nbsp;
          <select value={rows} onChange={e => changeSize(Number(e.target.value), cols)}
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px' }}>
            {[2,3,4,5,6,7].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Столбцов:&nbsp;
          <select value={cols} onChange={e => changeSize(rows, Number(e.target.value))}
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px' }}>
            {[2,3,4,5,6,7].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        {([0, 1, 2] as DrawMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 11px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
            border: mode === m ? '2px solid #38bdf8' : '1px solid #334155',
            background: mode === m ? '#0f172a' : '#1e293b', color: '#e2e8f0',
          }}>
            {m === 0 ? '⬛ Пусто' : m === 1 ? '🍊 Свежий' : '🤢 Гнилой'}
          </button>
        ))}

        <button onClick={reset} style={btnStyle(false)}>↩ Сброс</button>
      </div>

      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${cols}, ${cs}px)`,
        gap: 4, background: '#0f172a', padding: 12, borderRadius: 12,
      }}>
        {grid.map((row, r) => row.map((_, c) => {
          const { bg, emoji, sub, glow, dimSub } = getCellInfo(r, c);
          const isEmpty = grid[r][c] === 0;
          return (
            <div key={`${r}-${c}`} onClick={() => handleCell(r, c)} style={{
              width: cs, height: cs, background: bg, borderRadius: 8,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s',
              fontSize: isEmpty ? 18 : cs > 55 ? 26 : 22,
              color: isEmpty ? '#334155' : undefined,
              boxShadow: glow ? '0 0 14px #ef4444, 0 0 6px #ef4444' : 'none',
              outline: glow ? '2px solid #ef4444' : 'none',
            }}>
              {emoji}
              {sub && !isEmpty && (
                <span style={{
                  fontSize: 10, lineHeight: 1, marginTop: -1,
                  color: dimSub ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
                }}>
                  {sub}
                </span>
              )}
            </div>
          );
        }))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { bg: '#1e293b', label: '⬛ Пусто'           },
          { bg: '#166534', label: '🍊 Свежий'          },
          { bg: '#92400e', label: '🤢 Гнилой'          },
          { bg: '#dc2626', label: '🤢 Только что сгнил' },
        ].map(({ bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: bg, flexShrink: 0 }} />
            <span style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>

      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14 }}>
          {time === -1
            ? <span style={{ color: '#f87171' }}>Часть апельсинов недостижима → результат: <strong>-1</strong></span>
            : <span style={{ color: '#94a3b8' }}>Все сгниют за: <strong style={{ color: '#22c55e', fontSize: 20 }}>{time}</strong> мин.</span>
          }
        </div>
      )}

      {stepIdx !== null && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>
            Минута&nbsp;
            <strong style={{ color: '#e2e8f0', fontSize: 20 }}>{stepIdx}</strong>
            &nbsp;/&nbsp;{maxMinute}
          </div>
          <div>
            Свежих осталось:&nbsp;
            <strong style={{ color: freshLeft === 0 ? '#22c55e' : '#fbbf24' }}>{freshLeft}</strong>
          </div>
          {isLast && time !== -1 && (
            <div style={{ color: '#22c55e', fontWeight: 'bold', marginTop: 4 }}>
              Все апельсины сгнили! Ответ: {time} мин.
            </div>
          )}
          {isLast && time === -1 && (
            <div style={{ color: '#f87171', fontWeight: 'bold', marginTop: 4 }}>
              Осталось {freshLeft} недостижимых 🍊 → результат: -1
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setStepIdx(0); setPlaying(true); }}
          style={{ padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', background: '#16a34a', color: '#fff', border: 'none' }}
        >
          ▶ Запустить BFS
        </button>

        {stepIdx !== null && (
          <>
            <button onClick={() => { setPlaying(false); setStepIdx(0); }}                             disabled={stepIdx === 0} style={btnStyle(stepIdx === 0)}>⏮</button>
            <button onClick={() => setStepIdx(i => Math.max(0, (i ?? 0) - 1))}                       disabled={stepIdx === 0} style={btnStyle(stepIdx === 0)}>←</button>
            <button onClick={() => setPlaying(p => !p)}                                               disabled={isLast}       style={btnStyle(isLast)}>{playing ? '⏸ Пауза' : '▶ Авто'}</button>
            <button onClick={() => setStepIdx(i => Math.min(totalSteps - 1, (i ?? 0) + 1))}          disabled={isLast}       style={btnStyle(isLast)}>→</button>
            <button onClick={() => { setPlaying(false); setStepIdx(totalSteps - 1); }}                disabled={isLast}       style={btnStyle(isLast)}>⏭</button>
            <button onClick={() => { setStepIdx(null); setPlaying(false); }}                                                  style={btnStyle(false)}>✕ Сбросить</button>
          </>
        )}
      </div>
    </div>
  );
}
