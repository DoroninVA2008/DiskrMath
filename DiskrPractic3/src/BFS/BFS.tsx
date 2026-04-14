import { useState, useEffect, useRef } from 'react';

type Pos = { x: number; y: number };

const NODE_POS: Record<number, Pos> = {
  0:  { x: 310, y: 45  },
  1:  { x: 190, y: 120 },
  2:  { x: 430, y: 120 },
  3:  { x: 105, y: 200 },
  4:  { x: 310, y: 200 },
  5:  { x: 515, y: 200 },
  6:  { x: 60,  y: 285 },
  7:  { x: 220, y: 285 },
  8:  { x: 400, y: 285 },
  9:  { x: 560, y: 285 },
  10: { x: 30,  y: 370 },
  11: { x: 145, y: 370 },
  12: { x: 310, y: 370 },
  13: { x: 560, y: 370 },
};

const EDGES: [number, number][] = [
  [0, 1], [0, 2],
  [1, 3], [1, 4],
  [2, 4], [2, 5],
  [3, 6],
  [4, 7], [4, 8],
  [5, 9],
  [6, 10], [6, 11],
  [7, 11],
  [8, 12],
  [9, 13],
];

const ADJ: Record<number, number[]> = {};
for (const [a, b] of EDGES) {
  (ADJ[a] ??= []).push(b);
  (ADJ[b] ??= []).push(a);
}

for (const k in ADJ) ADJ[k].sort((a, b) => a - b);

const START  = 0;
const TARGET = 10;

interface Step {
  phase:    'dequeue' | 'explore' | 'found';
  current:  number;
  queue:    number[];
  visited:  number[];
  parent:   Record<number, number>;
  newEdge?: [number, number];
  path:     number[];
  desc:     string;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const visited = new Set<number>([START]);
  const parent: Record<number, number> = {};
  const queue: number[] = [START];

  steps.push({
    phase: 'dequeue',
    current: -1,
    queue: [...queue],
    visited: [...visited],
    parent: {},
    path: [],
    desc: `Добавляем стартовый узел 0 в очередь. Очередь: [0]`,
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;

    if (cur === TARGET) {
      const path: number[] = [];
      let v: number | undefined = cur;
      while (v !== undefined) { path.unshift(v); v = parent[v]; }
      steps.push({
        phase: 'found',
        current: cur,
        queue: [...queue],
        visited: [...visited],
        parent: { ...parent },
        path,
        desc: `Извлекаем ${cur} — это ЦЕЛЬ! Путь: ${path.join(' → ')}`,
      });
      break;
    }

    steps.push({
      phase: 'dequeue',
      current: cur,
      queue: [...queue],
      visited: [...visited],
      parent: { ...parent },
      path: [],
      desc: `Извлекаем ${cur} из очереди. Обрабатываем соседей…`,
    });

    for (const nb of ADJ[cur] ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent[nb] = cur;
        queue.push(nb);
        steps.push({
          phase: 'explore',
          current: cur,
          queue: [...queue],
          visited: [...visited],
          parent: { ...parent },
          newEdge: [cur, nb],
          path: [],
          desc: `Сосед ${nb} не посещён → добавляем в очередь. Очередь: [${[...queue].join(', ')}]`,
        });
      }
    }
  }

  return steps;
}

const ALL_STEPS = buildSteps();

function nodeColor(id: number, step: Step): string {
  if (step.path.includes(id))          return '#22c55e';
  if (id === TARGET && step.phase !== 'found') return '#16a34a';
  if (id === START && step.current === -1)     return '#38bdf8';
  if (id === step.current)             return '#f97316';
  if (step.queue.includes(id))         return '#fbbf24';
  if (step.visited.includes(id))       return '#60a5fa';
  return '#94a3b8';
}

function edgeColor(a: number, b: number, step: Step): { stroke: string; width: number } {

  if (
    step.path.length > 1 &&
    step.path.includes(a) &&
    step.path.includes(b) &&
    Math.abs(step.path.indexOf(a) - step.path.indexOf(b)) === 1
  ) return { stroke: '#22c55e', width: 3 };

  if (
    step.newEdge &&
    ((step.newEdge[0] === a && step.newEdge[1] === b) ||
     (step.newEdge[0] === b && step.newEdge[1] === a))
  ) return { stroke: '#fbbf24', width: 2.5 };

  return { stroke: '#475569', width: 1.5 };
}

export default function BFS() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = ALL_STEPS[idx];
  const isLast = idx === ALL_STEPS.length - 1;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setIdx(i => {
          if (i >= ALL_STEPS.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 900);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  const btn = (label: string, action: () => void, disabled: boolean) => (
    <button
      onClick={action}
      disabled={disabled}
      style={{
        padding: '7px 14px', cursor: disabled ? 'default' : 'pointer',
        borderRadius: 6, border: '1px solid #334155',
        background: disabled ? '#1e293b' : '#334155',
        color: disabled ? '#475569' : '#e2e8f0', fontSize: 13,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, maxWidth: 660, margin: '0 auto', color: '#e2e8f0' }}>
      <h2 style={{ marginBottom: 4 }}>BFS — Поиск в ширину</h2>
      <p style={{ color: '#94a3b8', marginTop: 0 }}>
        Старт: <strong style={{ color: '#38bdf8' }}>0</strong>
        &nbsp;|&nbsp;Цель: <strong style={{ color: '#22c55e' }}>10</strong>
      </p>
      <svg
        viewBox="0 0 620 410"
        width="100%"
        style={{ background: '#0f172a', borderRadius: 12, display: 'block' }}
      >
        {EDGES.map(([a, b]) => {
          const { stroke, width } = edgeColor(a, b, step);
          const pa = NODE_POS[a], pb = NODE_POS[b];
          return (
            <line key={`${a}-${b}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={stroke} strokeWidth={width}
            />
          );
        })}
        {Object.entries(NODE_POS).map(([idStr, { x, y }]) => {
          const id = Number(idStr);
          const color = nodeColor(id, step);
          const r = 17;
          const fontSize = id >= 10 ? 10 : 12;
          return (
            <g key={id}>
              <circle cx={x} cy={y} r={r} fill={color} stroke="#1e293b" strokeWidth={2} />
              <text x={x} y={y + 4} textAnchor="middle" fill="#fff"
                fontSize={fontSize} fontWeight="bold">
                {id}
              </text>
              {id === START && (
                <text x={x + r + 4} y={y + 4} fill="#38bdf8" fontSize={11}>start</text>
              )}
              {id === TARGET && (
                <text x={x + r + 4} y={y + 4} fill="#22c55e" fontSize={11}>target</text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10, fontSize: 12 }}>
        {[
          { color: '#94a3b8', label: 'Не посещён' },
          { color: '#38bdf8', label: 'Старт'       },
          { color: '#fbbf24', label: 'В очереди'   },
          { color: '#f97316', label: 'Текущий'      },
          { color: '#60a5fa', label: 'Посещён'      },
          { color: '#22c55e', label: 'Путь / Цель'  },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            <span style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, padding: '12px 16px', background: '#1e293b',
        borderRadius: 8, fontSize: 14, lineHeight: 1.7,
      }}>
        <div style={{ color: '#94a3b8', marginBottom: 4 }}>
          Шаг <strong style={{ color: '#e2e8f0' }}>{idx}</strong> из {ALL_STEPS.length - 1}
        </div>
        <div>
          Текущий узел:{' '}
          <strong style={{ color: '#f97316' }}>
            {step.current === -1 ? '—' : step.current}
          </strong>
        </div>
        <div>
          Очередь:{' '}
          <strong style={{ color: '#fbbf24' }}>
            [{step.queue.join(', ')}]
          </strong>
        </div>
        <div>
          Посещённые:{' '}
          <strong style={{ color: '#60a5fa' }}>
            {'{'}{ step.visited.join(', ') }{'}'}
          </strong>
        </div>
        {step.phase === 'found' && (
          <div style={{ color: '#22c55e', marginTop: 6, fontWeight: 'bold' }}>
            Цель найдена! Путь: {step.path.join(' → ')}
          </div>
        )}
        <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 13 }}>
          {step.desc}
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {btn('⏮ В начало',  () => { setPlaying(false); setIdx(0); },                       idx === 0)}
        {btn('← Назад',    () => setIdx(i => Math.max(0, i - 1)),                          idx === 0)}
        {btn(playing ? '⏸ Пауза' : '▶ Авто', () => setPlaying(p => !p),                   isLast)}
        {btn('Вперёд →',   () => setIdx(i => Math.min(ALL_STEPS.length - 1, i + 1)),       isLast)}
        {btn('В конец ⏭',  () => { setPlaying(false); setIdx(ALL_STEPS.length - 1); },     isLast)}
      </div>
    </div>
  );
}
