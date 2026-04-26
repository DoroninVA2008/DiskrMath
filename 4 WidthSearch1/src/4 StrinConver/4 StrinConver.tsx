import { useState, useEffect, useRef, useMemo } from 'react';

type Pos = { x: number; y: number };

function diffCount(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function buildAdj(words: string[]): Map<string, string[]> {
  const adj = new Map<string, string[]>(words.map(w => [w, []]));
  for (let i = 0; i < words.length; i++)
    for (let j = i + 1; j < words.length; j++)
      if (diffCount(words[i], words[j]) === 1) {
        adj.get(words[i])!.push(words[j]);
        adj.get(words[j])!.push(words[i]);
      }
  return adj;
}

function bfsDist(start: string, adj: Map<string, string[]>): Map<string, number> {
  const dist = new Map<string, number>([[start, 0]]);
  const q = [start]; let h = 0;
  while (h < q.length) {
    const cur = q[h++];
    for (const nb of adj.get(cur) ?? [])
      if (!dist.has(nb)) { dist.set(nb, dist.get(cur)! + 1); q.push(nb); }
  }
  return dist;
}

const SVG_W  = 580;
const NODE_H = 36;
const LVL_H  = 90;
const nW     = (w: string) => Math.max(58, w.length * 14 + 18);

function computeLayout(words: string[], dist: Map<string, number>): Map<string, Pos> {
  const maxD = Math.max(0, ...words.map(w => dist.get(w) ?? -1));
  const groups = new Map<number, string[]>();
  for (const w of words) {
    const d = dist.has(w) ? dist.get(w)! : maxD + 1;
    (groups.get(d) ?? (groups.set(d, []), groups.get(d)!)).push(w);
  }
  const pos = new Map<string, Pos>();
  const levels = Array.from(groups.keys()).sort((a, b) => a - b);
  levels.forEach((lvl, i) => {
    const row = groups.get(lvl)!;
    const y = i * LVL_H + 50;
    const gap = SVG_W / (row.length + 1);
    row.forEach((w, j) => pos.set(w, { x: (j + 1) * gap, y }));
  });
  return pos;
}

interface Step {
  current: string;
  queue:   string[];
  dist:    Map<string, number>;
  found:   boolean;
  path:    string[];
}

function buildSteps(wordA: string, wordB: string, wordList: string[]): Step[] {
  const all = [...new Set([wordA, wordB, ...wordList])];
  const adj = buildAdj(all);
  const steps: Step[] = [];

  const dist   = new Map<string, number>([[wordA, 0]]);
  const parent = new Map<string, string | null>([[wordA, null]]);
  const queue: string[] = [wordA];

  while (queue.length > 0) {
    const cur = queue.shift()!;

    if (cur === wordB) {
      const path: string[] = [];
      let w: string | null = cur;
      while (w !== null) { path.unshift(w); w = parent.get(w) ?? null; }
      steps.push({ current: cur, queue: [...queue], dist: new Map(dist), found: true, path });
      break;
    }

    for (const nb of (adj.get(cur) ?? []).sort()) {
      if (!dist.has(nb)) {
        dist.set(nb, dist.get(cur)! + 1);
        parent.set(nb, cur);
        queue.push(nb);
      }
    }

    steps.push({ current: cur, queue: [...queue], dist: new Map(dist), found: false, path: [] });
  }

  return steps;
}

function nodeColor(w: string, step: Step | null, wA: string, wB: string): string {
  if (step?.path.includes(w))   return '#fbbf24'; // путь
  if (w === step?.current)       return '#f97316'; // текущий
  if (step?.queue.includes(w))   return '#818cf8'; // в очереди
  if (step?.dist.has(w))         return '#475569'; // посещён
  if (w === wA)                  return '#0ea5e9'; // старт
  if (w === wB)                  return '#16a34a'; // цель
  return '#1e293b';                                 // не посещён
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

export default function StrinConver() {
  const [wordA,     setWordA]     = useState('hit');
  const [wordB,     setWordB]     = useState('cog');
  const [wordsText, setWordsText] = useState('hot, dot, dog, lot, log, cog');
  const [stepIdx,   setStepIdx]   = useState<number | null>(null);
  const [playing,   setPlaying]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wordList = useMemo(() =>
    [...new Set(wordsText.split(/[\s,]+/).map(w => w.trim().toLowerCase()).filter(Boolean))],
    [wordsText]
  );

  const allWords = useMemo(() => [...new Set([wordA, wordB, ...wordList])], [wordA, wordB, wordList]);
  const adj      = useMemo(() => buildAdj(allWords), [allWords]);
  const fullDist = useMemo(() => bfsDist(wordA, adj), [wordA, adj]);
  const layout   = useMemo(() => computeLayout(allWords, fullDist), [allWords, fullDist]);
  const steps    = useMemo(() => buildSteps(wordA, wordB, wordList), [wordA, wordB, wordList]);

  const step   = stepIdx !== null ? steps[stepIdx] : null;
  const isLast = stepIdx !== null && stepIdx >= steps.length - 1;

  const answer = wordA === wordB ? 0 : (fullDist.get(wordB) ?? -1);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i === null || i >= steps.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 700);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, steps.length]);

  const resetInput = () => {
    setWordA('hit'); setWordB('cog'); setWordsText('hot, dot, dog, lot, log, cog');
    setStepIdx(null); setPlaying(false);
  };
  const changeWord = (setter: (v: string) => void) => (v: string) => {
    setter(v.toLowerCase()); setStepIdx(null); setPlaying(false);
  };

  const edges = useMemo(() => {
    const res: [string, string][] = [];
    const seen = new Set<string>();
    for (const [w, nb] of adj.entries())
      for (const n of nb) {
        const k = [w, n].sort().join('\x00');
        if (!seen.has(k)) { seen.add(k); res.push([w, n]); }
      }
    return res;
  }, [adj]);

  const svgH = Math.max(120, Math.max(...Array.from(layout.values()).map(p => p.y)) + NODE_H / 2 + 50);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 660, margin: '0 auto', color: '#e2e8f0' }}>
      <h2 style={{ marginBottom: 4 }}>4. Преобразование строки</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>
        Каждый шаг — изменить 1 символ, получив слово из списка. Найти минимум шагов из{' '}
        <span style={{ color: '#38bdf8' }}>A</span> в <span style={{ color: '#22c55e' }}>B</span>.
        Узлы расположены по уровням BFS (расстоянию от A). Цифра на узле — шаг заражения.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
        <label style={{ fontSize: 13 }}>
          A (старт):
          <input
            value={wordA}
            onChange={e => changeWord(setWordA)(e.target.value)}
            style={{ display: 'block', marginTop: 4, padding: '5px 10px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, width: 76, fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}
          />
        </label>
        <span style={{ fontSize: 22, paddingBottom: 4, color: '#64748b' }}>→</span>
        <label style={{ fontSize: 13 }}>
          B (цель):
          <input
            value={wordB}
            onChange={e => changeWord(setWordB)(e.target.value)}
            style={{ display: 'block', marginTop: 4, padding: '5px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, width: 76, fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}
          />
        </label>
        <label style={{ fontSize: 13, flex: 1, minWidth: 200 }}>
          Список слов (через запятую):
          <input
            value={wordsText}
            onChange={e => { setWordsText(e.target.value); setStepIdx(null); setPlaying(false); }}
            style={{ display: 'block', marginTop: 4, padding: '5px 10px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, width: '100%', fontSize: 13 }}
          />
        </label>
        <button onClick={resetInput} style={{ ...btnStyle(false), paddingBottom: 8 }}>↩ Сброс</button>
      </div>

      <div style={{ background: '#0f172a', borderRadius: 12, overflow: 'hidden' }}>
        <svg width={SVG_W} height={svgH} style={{ display: 'block' }}>
          {edges.map(([a, b]) => {
            const pa = layout.get(a), pb = layout.get(b);
            if (!pa || !pb) return null;
            const onPath =
              step?.path.includes(a) && step?.path.includes(b) &&
              Math.abs(step.path.indexOf(a) - step.path.indexOf(b)) === 1;
            return (
              <line key={`${a}${b}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={onPath ? '#fbbf24' : '#334155'}
                strokeWidth={onPath ? 2.5 : 1.5}
              />
            );
          })}

          {allWords.map(w => {
            const pos = layout.get(w);
            if (!pos) return null;
            const color = nodeColor(w, step, wordA, wordB);
            const width = nW(w);
            const dist  = step?.dist.get(w);
            const isA   = w === wordA;
            const isB   = w === wordB;
            return (
              <g key={w}>
                <rect
                  x={pos.x - width / 2} y={pos.y - NODE_H / 2}
                  width={width} height={NODE_H} rx={8}
                  fill={color} stroke="#0f172a" strokeWidth={2}
                />
                <text
                  x={pos.x} y={pos.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={13} fontWeight="bold"
                >
                  {w}
                </text>
                {dist !== undefined && (
                  <text
                    x={pos.x + width / 2 - 7} y={pos.y - NODE_H / 2 + 9}
                    textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={9}
                  >{dist}</text>
                )}
                {isA && (
                  <text x={pos.x - width / 2 - 11} y={pos.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#38bdf8" fontSize={11} fontWeight="bold">A</text>
                )}
                {isB && (
                  <text x={pos.x + width / 2 + 11} y={pos.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#22c55e" fontSize={11} fontWeight="bold">B</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { c: '#0ea5e9', l: 'Старт A'   },
          { c: '#16a34a', l: 'Цель B'    },
          { c: '#f97316', l: 'Текущий'   },
          { c: '#818cf8', l: 'В очереди' },
          { c: '#475569', l: 'Посещён'   },
          { c: '#fbbf24', l: 'Путь'      },
          { c: '#1e293b', l: 'Не достигнут' },
        ].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: c, border: '1px solid #334155', flexShrink: 0 }} />
            <span style={{ color: '#94a3b8' }}>{l}</span>
          </div>
        ))}
      </div>

      {stepIdx === null && (
        <div style={{ marginTop: 12, padding: '10px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14 }}>
          {answer === -1
            ? <span style={{ color: '#f87171' }}>Путь невозможен → результат: <strong>-1</strong></span>
            : answer === 0
            ? <span style={{ color: '#22c55e' }}>A = B, шагов: <strong>0</strong></span>
            : <>
                <span style={{ color: '#94a3b8' }}>Минимум шагов: </span>
                <strong style={{ color: '#22c55e', fontSize: 20 }}>{answer}</strong>
                {steps.at(-1)?.found && (
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    {' '}— {steps.at(-1)!.path.join(' → ')}
                  </span>
                )}
              </>
          }
        </div>
      )}

      {step && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: '#1e293b', borderRadius: 8, fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: '#94a3b8', marginBottom: 2 }}>
            Шаг <strong style={{ color: '#e2e8f0' }}>{stepIdx! + 1}</strong> из {steps.length}
          </div>
          <div>
            Обрабатываем: <strong style={{ color: '#f97316' }}>«{step.current}»</strong>
            {step.dist.get(step.current) !== undefined &&
              <span style={{ color: '#64748b' }}> — шаг #{step.dist.get(step.current)}</span>}
          </div>
          <div>
            Очередь:{' '}
            <strong style={{ color: '#818cf8' }}>
              [{step.queue.slice(0, 10).join(', ')}{step.queue.length > 10 ? ' …' : ''}]
            </strong>
          </div>
          {step.found && (
            <div style={{ color: '#22c55e', fontWeight: 'bold', marginTop: 6 }}>
              Найдено! Минимум шагов: {step.path.length - 1}
              <br />
              <span style={{ fontWeight: 'normal', fontSize: 13, letterSpacing: 1 }}>
                {step.path.join(' → ')}
              </span>
            </div>
          )}
          {!step.found && isLast && (
            <div style={{ color: '#f87171', fontWeight: 'bold', marginTop: 6 }}>
              Очередь пуста, «{wordB}» недостижим → -1
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
            <button onClick={() => { setPlaying(false); setStepIdx(0); }}                            disabled={stepIdx === 0} style={btnStyle(stepIdx === 0)}>⏮</button>
            <button onClick={() => setStepIdx(i => Math.max(0, (i ?? 0) - 1))}                      disabled={stepIdx === 0} style={btnStyle(stepIdx === 0)}>←</button>
            <button onClick={() => setPlaying(p => !p)}                                              disabled={isLast}       style={btnStyle(isLast)}>{playing ? '⏸ Пауза' : '▶ Авто'}</button>
            <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, (i ?? 0) + 1))}       disabled={isLast}       style={btnStyle(isLast)}>→</button>
            <button onClick={() => { setPlaying(false); setStepIdx(steps.length - 1); }}             disabled={isLast}       style={btnStyle(isLast)}>⏭</button>
            <button onClick={() => { setStepIdx(null); setPlaying(false); }}                                                 style={btnStyle(false)}>✕ Сбросить</button>
          </>
        )}
      </div>
    </div>
  );
}
