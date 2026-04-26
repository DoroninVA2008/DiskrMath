import { useState, useEffect, useRef, useCallback } from 'react';

type Pos      = [number, number];
type EditMode = 'start' | 'end';

const SIZE = 8;
const CELL = 60;

const KNIGHT: Pos[] = [
  [-2, -1], [-2, 1],
  [-1, -2], [-1, 2],
  [ 1, -2], [ 1, 2],
  [ 2, -1], [ 2, 1],
];

interface BFSStep {
  current: Pos;
  queue:   Pos[];
  distMap: number[][];
  found:   boolean;
  path:    Pos[];
}

function buildSteps(start: Pos, end: Pos): BFSStep[] {
  const [sr, sc] = start;
  const [er, ec] = end;
  const steps: BFSStep[] = [];

  const distMap: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(-1));
  const parent: (Pos | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  distMap[sr][sc] = 0;

  if (sr === er && sc === ec) {
    steps.push({ current: [sr, sc], queue: [], distMap: distMap.map(r => [...r]), found: true, path: [[sr, sc]] });
    return steps;
  }

  const queue: Pos[] = [[sr, sc]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;

    if (r === er && c === ec) {
      const path: Pos[] = [];
      let cur: Pos | null = [r, c];
      while (cur) { path.unshift(cur); cur = parent[cur[0]][cur[1]]; }
      steps.push({ current: [r, c], queue: [...queue], distMap: distMap.map(row => [...row]), found: true, path });
      break;
    }

    for (const [dr, dc] of KNIGHT) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && distMap[nr][nc] === -1) {
        distMap[nr][nc] = distMap[r][c] + 1;
        parent[nr][nc] = [r, c];
        queue.push([nr, nc]);
      }
    }

    steps.push({ current: [r, c], queue: [...queue], distMap: distMap.map(row => [...row]), found: false, path: [] });
  }

  return steps;
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 13px', borderRadius: 6, fontSize: 13,
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid #334155',
    background: disabled ? '#1e293b' : '#334155',
    color:      disabled ? '#475569' : '#e2e8f0',
  };
}


export default function MinKnightMoves() {
  const [start,   setStart]   = useState<Pos>([0, 0]);
  const [end,     setEnd]     = useState<Pos>([7, 7]);
  const [mode,    setMode]    = useState<EditMode>('start');
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps  = buildSteps(start, end);
  const step   = stepIdx !== null ? steps[stepIdx] : null;
  const isLast = stepIdx !== null && stepIdx >= steps.length - 1;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= steps.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 300);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, steps.length]);

  const handleCell = useCallback((r: number, c: number) => {
    if (mode === 'start') setStart([r, c]);
    else                  setEnd([r, c]);
    setStepIdx(null); setPlaying(false);
  }, [mode]);

  const knightReach = new Set(
    KNIGHT.map(([dr, dc]) => `${start[0] + dr},${start[1] + dc}`)
      .filter(k => {
        const [r, c] = k.split(',').map(Number);
        return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
      })
  );

  const getCellInfo = (r: number, c: number) => {
    const isS     = r === start[0] && c === start[1];
    const isE     = r === end[0]   && c === end[1];
    const isLight = (r + c) % 2 === 0;
    const chessBg = isLight ? '#f0d9b5' : '#b58863';

    if (!step) {
      if (isS) return { bg: '#0ea5e9', label: '♞', tc: '#fff', outline: false };
      if (isE) return { bg: '#22c55e', label: '⚑', tc: '#fff', outline: false };
      const reach = !isS && knightReach.has(`${r},${c}`);
      return { bg: chessBg, label: '', tc: '', outline: reach };
    }

    const dist    = step.distMap[r][c];
    const inPath  = step.path.some(([pr, pc]) => pr === r && pc === c);
    const isCur   = step.current[0] === r && step.current[1] === c;
    const inQueue = step.queue.some(([qr, qc]) => qr === r && qc === c);
    const distLbl = dist >= 0 ? String(dist) : '';
    const iconLbl = isS ? '♞' : isE ? '⚑' : '';
    const label   = iconLbl || distLbl;

    if (inPath)  return { bg: '#fbbf24', label: iconLbl || distLbl, tc: '#1e293b', outline: false };
    if (isCur)   return { bg: '#f97316', label,                     tc: '#fff',    outline: false };
    if (inQueue) return { bg: '#818cf8', label,                     tc: '#fff',    outline: false };
    if (dist >= 0) return { bg: '#334155', label,                   tc: '#94a3b8', outline: false };
    if (isS) return { bg: '#0ea5e9', label: '♞', tc: '#fff', outline: false };
    if (isE) return { bg: '#166534', label: '⚑', tc: '#6ee7b7', outline: false };
    return { bg: chessBg, label: '', tc: '', outline: false };
  };

  const lastStep = steps.at(-1);
  const answer   = lastStep?.found ? lastStep.path.length - 1 : '—';

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 660, margin: '0 auto', color: '#e2e8f0' }}>
      <h2 style={{ marginBottom: 4 }}>2. Минимальные ходы коня</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>
        Доска 8×8. Найти минимальное число ходов конём (♞) из{' '}
        <span style={{ color: '#38bdf8' }}>старта</span> до{' '}
        <span style={{ color: '#22c55e' }}>цели (⚑)</span>. Ход коня: Г-образно (±1,±2) или (±2,±1).
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>Клик по доске:</span>
        {(['start', 'end'] as EditMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
            border: mode === m ? '2px solid #38bdf8' : '1px solid #334155',
            background: mode === m ? '#0f172a' : '#1e293b',
            color: m === 'start' ? '#38bdf8' : '#22c55e',
          }}>
            {m === 'start' ? '♞ Поставить коня' : '⚑ Поставить цель'}
          </button>
        ))}
        <button onClick={() => { setStart([0,0]); setEnd([7,7]); setStepIdx(null); setPlaying(false); }} style={btnStyle(false)}>
          ↩ Сброс
        </button>
      </div>

      <div style={{ display: 'inline-block', border: '3px solid #334155', borderRadius: 4, background: '#1e293b' }}>

        <div style={{ display: 'flex', paddingLeft: 24 }}>
          {Array.from({ length: SIZE }, (_, c) => (
            <div key={c} style={{ width: CELL, textAlign: 'center', fontSize: 11, color: '#64748b', padding: '4px 0 2px' }}>{c}</div>
          ))}
        </div>
        {Array.from({ length: SIZE }, (_, r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 24, textAlign: 'center', fontSize: 11, color: '#64748b', flexShrink: 0 }}>{r}</div>
            {Array.from({ length: SIZE }, (_, c) => {
              const { bg, label, tc, outline } = getCellInfo(r, c);
              const isIcon = label === '♞' || label === '⚑';
              return (
                <div
                  key={c}
                  onClick={() => handleCell(r, c)}
                  style={{
                    width: CELL, height: CELL, background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isIcon ? 24 : 13, fontWeight: 'bold', color: tc,
                    cursor: 'pointer', userSelect: 'none',
                    transition: 'background 0.12s',
                    outline: outline ? '3px dashed #38bdf8' : 'none',
                    outlineOffset: '-3px',
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { bg: '#0ea5e9', label: '♞ Конь (старт)' },
          { bg: '#22c55e', label: '⚑ Цель'         },
          { bg: '#f97316', label: 'Текущий'         },
          { bg: '#818cf8', label: 'В очереди'       },
          { bg: '#334155', label: 'Посещён (dist)'  },
          { bg: '#fbbf24', label: 'Кратчайший путь' },
        ].map(({ bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: bg, flexShrink: 0 }} />
            <span style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 13, height: 13, borderRadius: 3, outline: '2px dashed #38bdf8', outlineOffset: '-2px', background: '#f0d9b5' }} />
          <span style={{ color: '#94a3b8' }}>Ход коня (до BFS)</span>
        </div>
      </div>

      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14 }}>
          <span style={{ color: '#94a3b8' }}>
            ({start[0]},{start[1]}) → ({end[0]},{end[1]}) — минимум ходов:{' '}
          </span>
          <strong style={{ color: '#22c55e', fontSize: 20 }}>{answer}</strong>
        </div>
      )}

      {step && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>
            Шаг <strong style={{ color: '#e2e8f0' }}>{stepIdx! + 1}</strong> из {steps.length}
          </div>
          <div>
            Текущая клетка:{' '}
            <strong style={{ color: '#f97316' }}>({step.current[0]}, {step.current[1]})</strong>
            {' '}— ход №<strong>{step.distMap[step.current[0]][step.current[1]]}</strong>
          </div>
          <div>
            Очередь:{' '}
            <strong style={{ color: '#818cf8', fontSize: 12 }}>
              [{step.queue.slice(0, 10).map(([r, c]) => `(${r},${c})`).join(', ')}
              {step.queue.length > 10 ? ` …+${step.queue.length - 10}` : ''}]
            </strong>
          </div>
          {step.found && (
            <div style={{ color: '#22c55e', marginTop: 6, fontWeight: 'bold' }}>
              Цель достигнута! Минимум ходов: {step.path.length - 1}
              <br />
              <span style={{ fontWeight: 'normal', fontSize: 12 }}>
                {step.path.map(([r, c]) => `(${r},${c})`).join(' → ')}
              </span>
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
            <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, (i ?? 0) + 1))}        disabled={isLast}       style={btnStyle(isLast)}>→</button>
            <button onClick={() => { setPlaying(false); setStepIdx(steps.length - 1); }}              disabled={isLast}       style={btnStyle(isLast)}>⏭</button>
            <button onClick={() => { setStepIdx(null); setPlaying(false); }}                                                  style={btnStyle(false)}>✕ Сбросить</button>
          </>
        )}
      </div>
    </div>
  );
}
