import { useState, useEffect, useRef, useCallback } from 'react'

type Cell     = 0 | 1;
type Pos      = [number, number];
type EditMode = 'wall' | 'start' | 'end';

const DIRS: Pos[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

interface BFSStep {
  current:  Pos;
  queue:    Pos[];
  distMap:  number[][];
  found:    boolean;
  path:     Pos[];
}

function buildSteps(maze: Cell[][], start: Pos, end: Pos): BFSStep[] {
  const n = maze.length;
  const [sr, sc] = start;
  const [er, ec] = end;
  const steps: BFSStep[] = [];

  if (maze[sr]?.[sc] !== 0 || maze[er]?.[ec] !== 0) return steps;

  const distMap: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  const parent:  (Pos | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  distMap[sr][sc] = 0;
  const queue: Pos[] = [[sr, sc]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;

    if (r === er && c === ec) {
      const path: Pos[] = [];
      let cur: Pos | null = [r, c];
      while (cur) { path.unshift(cur); cur = parent[cur[0]][cur[1]]; }
      steps.push({
        current: [r, c], queue: [...queue],
        distMap: distMap.map(row => [...row]),
        found: true, path,
      });
      break;
    }

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && maze[nr][nc] === 0 && distMap[nr][nc] === -1) {
        distMap[nr][nc] = distMap[r][c] + 1;
        parent[nr][nc] = [r, c];
        queue.push([nr, nc]);
      }
    }

    steps.push({
      current: [r, c], queue: [...queue],
      distMap: distMap.map(row => [...row]),
      found: false, path: [],
    });
  }

  return steps;
}

const DEFAULT_MAZE: Cell[][] = [
  [0, 0, 0],
  [1, 1, 0],
  [0, 0, 0],
];
const DEFAULT_START: Pos = [0, 0];
const DEFAULT_END:   Pos = [2, 2];

function cellPx(n: number) { return n <= 5 ? 58 : n <= 7 ? 48 : 40; }

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 13px', borderRadius: 6, fontSize: 13,
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid #334155',
    background: disabled ? '#1e293b' : '#334155',
    color:      disabled ? '#475569' : '#e2e8f0',
  };
}

export default function ShortPathInLabyrin() {
  const [maze,    setMaze]    = useState<Cell[][]>(DEFAULT_MAZE);
  const [n,       setN]       = useState(3);
  const [start,   setStart]   = useState<Pos>(DEFAULT_START);
  const [end,     setEnd]     = useState<Pos>(DEFAULT_END);
  const [mode,    setMode]    = useState<EditMode>('wall');
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps  = buildSteps(maze, start, end);
  const step   = stepIdx !== null ? steps[stepIdx] : null;
  const isLast = stepIdx !== null && stepIdx >= steps.length - 1;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= steps.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 450);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, steps.length]);

  const handleCell = useCallback((r: number, c: number) => {
    if (mode === 'wall') {
      if ((r === start[0] && c === start[1]) || (r === end[0] && c === end[1])) return;
      setMaze(prev => prev.map((row, ri) =>
        row.map((cell, ci) => ri === r && ci === c ? (cell === 0 ? 1 : 0) : cell) as Cell[]
      ));
    } else if (mode === 'start') {
      if (maze[r][c] === 1) return;
      setStart([r, c]);
    } else {
      if (maze[r][c] === 1) return;
      setEnd([r, c]);
    }
    setStepIdx(null); setPlaying(false);
  }, [mode, start, end, maze]);

  const handleN = (newN: number) => {
    const newMaze: Cell[][] = Array.from({ length: newN }, (_, r) =>
      Array.from({ length: newN }, (_, c) =>
        r < maze.length && c < maze[0].length ? maze[r][c] : 0
      ) as Cell[]
    );
    setN(newN); setMaze(newMaze);
    setStart([0, 0]); setEnd([newN - 1, newN - 1]);
    setStepIdx(null); setPlaying(false);
  };

  // ── Случайный лабиринт ──
  const randomMaze = () => {
    const m: Cell[][] = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => {
        if ((r === 0 && c === 0) || (r === n - 1 && c === n - 1)) return 0;
        return Math.random() < 0.28 ? 1 : 0;
      }) as Cell[]
    );
    setMaze(m); setStart([0, 0]); setEnd([n - 1, n - 1]);
    setStepIdx(null); setPlaying(false);
  };

  // ── Сброс ──
  const reset = () => {
    setMaze(DEFAULT_MAZE); setN(3);
    setStart(DEFAULT_START); setEnd(DEFAULT_END);
    setStepIdx(null); setPlaying(false);
  };

  const getCellInfo = (r: number, c: number) => {
    const isS    = r === start[0] && c === start[1];
    const isE    = r === end[0]   && c === end[1];
    const isWall = maze[r][c] === 1;

    if (isWall) return { bg: '#1e293b', label: '', tc: '' };

    const baseLabel = isS ? 'S' : isE ? 'E' : '';

    if (!step) {
      if (isS) return { bg: '#0ea5e9', label: 'S', tc: '#fff' };
      if (isE) return { bg: '#22c55e', label: 'E', tc: '#fff' };
      return { bg: '#f1f5f9', label: '', tc: '' };
    }

    const dist    = step.distMap[r][c];
    const inPath  = step.path.some(([pr, pc]) => pr === r && pc === c);
    const isCur   = step.current[0] === r && step.current[1] === c;
    const inQueue = step.queue.some(([qr, qc]) => qr === r && qc === c);
    const label   = baseLabel || (dist >= 0 ? String(dist) : '');

    if (inPath)  return { bg: '#fbbf24', label, tc: '#1e293b' };
    if (isCur)   return { bg: '#f97316', label, tc: '#fff'    };
    if (inQueue) return { bg: '#818cf8', label, tc: '#fff'    };
    if (dist >= 0) return { bg: '#475569', label, tc: '#cbd5e1' };

    if (isS) return { bg: '#0ea5e9', label: 'S', tc: '#fff' };
    if (isE) return { bg: '#166534', label: 'E', tc: '#6ee7b7' };
    return { bg: '#f1f5f9', label: '', tc: '' };
  };

  const lastStep = steps.at(-1);
  const previewResult = lastStep?.found
    ? `Кратчайший путь: ${lastStep.path.length - 1} шаг(а)`
    : steps.length > 0
    ? 'Путь невозможен → -1'
    : 'Старт или цель стоят на стене';

  const cs = cellPx(n);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 640, margin: '0 auto', color: '#e2e8f0' }}>
      <h2 style={{ marginBottom: 4 }}>1. Кратчайший путь в лабиринте</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>
        Матрица N×N: <strong>0</strong> — проход, <strong>1</strong> — стена.
        Найти минимальное число шагов от <span style={{ color: '#38bdf8' }}>S</span> до{' '}
        <span style={{ color: '#22c55e' }}>E</span>. Если путь невозможен — вернуть{' '}
        <strong style={{ color: '#f87171' }}>-1</strong>.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <label style={{ fontSize: 13 }}>
          Размер:&nbsp;
          <select
            value={n}
            onChange={e => handleN(Number(e.target.value))}
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px' }}
          >
            {[3,4,5,6,7,8].map(v => <option key={v} value={v}>{v}×{v}</option>)}
          </select>
        </label>

        {(['wall','start','end'] as EditMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
              border: mode === m ? '2px solid #38bdf8' : '1px solid #334155',
              background: mode === m ? '#0f172a' : '#1e293b',
              color: m === 'start' ? '#38bdf8' : m === 'end' ? '#22c55e' : '#e2e8f0',
            }}
          >
            {m === 'wall' ? '🧱 Стена' : m === 'start' ? 'S Старт' : 'E Цель'}
          </button>
        ))}

        <button onClick={randomMaze} style={btnStyle(false)}>🎲 Случайный</button>
        <button onClick={reset}      style={btnStyle(false)}>↩ Сброс</button>
      </div>

      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${n}, ${cs}px)`,
        gap: 3, background: '#0f172a', padding: 12, borderRadius: 12,
      }}>
        {maze.map((row, r) =>
          row.map((_, c) => {
            const { bg, label, tc } = getCellInfo(r, c);
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCell(r, c)}
                style={{
                  width: cs, height: cs, background: bg, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: cs > 50 ? 14 : 12, fontWeight: 'bold', color: tc,
                  cursor: 'pointer', userSelect: 'none',
                  border: '1px solid #0f172a', transition: 'background 0.15s',
                }}
              >
                {label}
              </div>
            );
          })
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { bg: '#f1f5f9', label: 'Проход',   border: '1px solid #cbd5e1' },
          { bg: '#1e293b', label: 'Стена'     },
          { bg: '#0ea5e9', label: 'Старт (S)' },
          { bg: '#22c55e', label: 'Цель (E)'  },
          { bg: '#f97316', label: 'Текущий'   },
          { bg: '#818cf8', label: 'В очереди' },
          { bg: '#475569', label: 'Посещён'   },
          { bg: '#fbbf24', label: 'Путь'      },
        ].map(({ bg, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: bg, border: border ?? 'none', flexShrink: 0 }} />
            <span style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14 }}>
          <span style={{ color: lastStep?.found ? '#22c55e' : '#f87171' }}>
            {previewResult}
          </span>
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
            {' '}— расстояние от старта:{' '}
            <strong>{step.distMap[step.current[0]][step.current[1]]}</strong>
          </div>
          <div>
            Очередь:{' '}
            <strong style={{ color: '#818cf8', fontSize: 13 }}>
              [{step.queue.map(([r, c]) => `(${r},${c})`).join(', ') || '—'}]
            </strong>
          </div>
          {step.found && (
            <div style={{ color: '#22c55e', marginTop: 6, fontWeight: 'bold' }}>
              Цель найдена! Минимальный путь: {step.path.length - 1} шагов
              <br />
              <span style={{ fontWeight: 'normal', fontSize: 13 }}>
                {step.path.map(([r, c]) => `(${r},${c})`).join(' → ')}
              </span>
            </div>
          )}
          {!step.found && isLast && (
            <div style={{ color: '#f87171', marginTop: 6, fontWeight: 'bold' }}>
              Очередь пуста — путь недостижим. Результат: -1
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setStepIdx(0); setPlaying(true); }}
          disabled={steps.length === 0}
          style={{
            padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 'bold',
            cursor: steps.length === 0 ? 'default' : 'pointer',
            background: steps.length === 0 ? '#166534' : '#16a34a', color: '#fff', border: 'none',
          }}
        >
          ▶ Запустить BFS
        </button>

        {stepIdx !== null && (
          <>
            <button onClick={() => { setPlaying(false); setStepIdx(0); }}                               disabled={stepIdx === 0}  style={btnStyle(stepIdx === 0)}>⏮</button>
            <button onClick={() => setStepIdx(i => Math.max(0, (i ?? 0) - 1))}                         disabled={stepIdx === 0}  style={btnStyle(stepIdx === 0)}>←</button>
            <button onClick={() => setPlaying(p => !p)}                                                 disabled={isLast}         style={btnStyle(isLast)}>{playing ? '⏸ Пауза' : '▶ Авто'}</button>
            <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, (i ?? 0) + 1))}          disabled={isLast}         style={btnStyle(isLast)}>→</button>
            <button onClick={() => { setPlaying(false); setStepIdx(steps.length - 1); }}                disabled={isLast}         style={btnStyle(isLast)}>⏭</button>
            <button onClick={() => { setStepIdx(null); setPlaying(false); }}                                                      style={btnStyle(false)}>✕ Сбросить</button>
          </>
        )}
      </div>
    </div>
  );
}
