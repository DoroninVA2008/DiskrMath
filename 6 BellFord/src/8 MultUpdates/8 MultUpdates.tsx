import React from "react"

type Edge = {
  from: string;
  to: string;
  weight: number;
};

type UpdateLog = {
  iteration: number;
  edge: string;
  fromDist: number;
  toDist: number;
  newDist: number;
  vertex: string;
};

const MultUpdates: React.FC = () => {
  const edges: Edge[] = [
    { from: "A", to: "B", weight: 1 },
    { from: "B", to: "C", weight: 1 },
    { from: "C", to: "D", weight: 1 },
    { from: "D", to: "A", weight: -4 },
  ];

  const vertices = ["A", "B", "C", "D"];
  const start = "A";
  const target = "D";

  const runBellmanFordWithLogs = (maxIterations: number = 10) => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const updateLogs: UpdateLog[] = [];

    vertices.forEach((v) => {
      dist[v] = Infinity;
      prev[v] = null;
    });
    dist[start] = 0;

    for (let iter = 1; iter <= maxIterations; iter++) {
      let updated = false;
      for (const edge of edges) {
        if (dist[edge.from] + edge.weight < dist[edge.to]) {
          const oldDist = dist[edge.to];
          dist[edge.to] = dist[edge.from] + edge.weight;
          prev[edge.to] = edge.from;
          updated = true;

          updateLogs.push({
            iteration: iter,
            edge: `${edge.from} → ${edge.to}`,
            fromDist: dist[edge.from],
            toDist: oldDist,
            newDist: dist[edge.to],
            vertex: edge.to,
          });
        }
      }
      if (!updated && iter < vertices.length) break;
    }

    return { dist, prev, updateLogs };
  };

  const detectNegativeCycle = () => {
    const dist: Record<string, number> = {};
    vertices.forEach((v) => {
      dist[v] = Infinity;
    });
    dist[start] = 0;

    for (let i = 0; i < vertices.length - 1; i++) {
      for (const edge of edges) {
        if (dist[edge.from] + edge.weight < dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + edge.weight;
        }
      }
    }

    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        return true;
      }
    }
    return false;
  };

  const hasNegativeCycle = detectNegativeCycle();
  const { dist, updateLogs } = runBellmanFordWithLogs(12);

  const findCycle = (): string[] => {
    const cycle: string[] = [];
    let current = "A";
    const visited = new Set<string>();

    for (let i = 0; i < 5; i++) {
      cycle.push(current);
      visited.add(current);
      const next = edges.find(e => e.from === current)?.to;
      if (!next) break;
      current = next;
    }
    return cycle;
  };

  const cycle = findCycle();
  const cycleWeight = edges.reduce((sum, e) => sum + e.weight, 0);

  const dUpdates = updateLogs.filter(log => log.vertex === target);
  const updateCount = dUpdates.length;

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Многократные обновления расстояния до D</h2>
        <p>Граф с отрицательным циклом A → B → C → D → A (сумма весов = −1).</p>
      </div>

      <div className="info-block info-block--blue">
        <h3>Граф с отрицательным циклом:</h3>
        <table className="bf-table">
          <thead>
            <tr>
              <th>От</th>
              <th>К</th>
              <th>Вес</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((e, idx) => (
              <tr key={idx}>
                <td>{e.from}</td>
                <td>{e.to}</td>
                <td className={e.weight < 0 ? "cell-neg" : ""}>{e.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
          Старт: <strong>A</strong> | Целевая вершина: <strong>D</strong>
        </div>
      </div>

      <div className={`info-block ${hasNegativeCycle ? "info-block--red" : "info-block--green"}`}>
        <h3>
          {hasNegativeCycle ? "ОТРИЦАТЕЛЬНЫЙ ЦИКЛ ОБНАРУЖЕН" : "Отрицательный цикл не обнаружен"}
        </h3>
        {hasNegativeCycle && (
          <>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Цикл:</strong> {cycle.join(" → ")} → {cycle[0]}
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Вес цикла:</strong> {edges.map(e => e.weight).join(" + ")} = {cycleWeight}
              <span style={{ fontWeight: "bold" }}> (отрицательный!)</span>
            </p>
          </>
        )}
      </div>

      <div className="info-block info-block--orange">
        <h3>Ответ на вопрос задачи:</h3>
        <p style={{ fontSize: "1.2rem", textAlign: "center", margin: "0.5rem 0" }}>
          <strong>Сколько раз обновится расстояние до D?</strong>
        </p>
        <p style={{ fontSize: "1.5rem", textAlign: "center", margin: "0.5rem 0", fontWeight: "bold" }}>
          БЕСКОНЕЧНО! (∞)
        </p>
        <p style={{ textAlign: "center", margin: "0.5rem 0" }}>
          Из-за отрицательного цикла расстояние до D можно уменьшать бесконечно.
        </p>
      </div>

      <details className="details-toggle" open>
        <summary>Лог обновлений расстояния до D (первые {updateCount} итераций)</summary>
        <div className="details-body">
          <table className="bf-table">
            <thead>
              <tr>
                <th>Итерация</th>
                <th>Ребро</th>
                <th>Текущее расстояние до начала ребра</th>
                <th>Старое расстояние до вершины</th>
                <th>Новое расстояние</th>
                <th>Обновляемая вершина</th>
              </tr>
            </thead>
            <tbody>
              {updateLogs.map((log, idx) => (
                <tr key={idx} className={log.vertex === target ? "row-red" : ""}>
                  <td>{log.iteration}</td>
                  <td>{log.edge}</td>
                  <td>{log.fromDist}</td>
                  <td>{log.toDist === Infinity ? "∞" : log.toDist}</td>
                  <td className="row-green">{log.newDist}</td>
                  <td><strong>{log.vertex}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-note">
            И это только начало! При каждой новой итерации расстояние будет уменьшаться на 1.
          </p>
        </div>
      </details>

      <details className="details-toggle">
        <summary>Пошаговое объяснение работы алгоритма</summary>
        <div className="details-body">
          <div className="info-block info-block--yellow" style={{ marginBottom: 0 }}>
            <h4>Алгоритм Беллмана–Форда:</h4>
            <ol className="step-list">
              <li><strong>Инициализация:</strong> dist[A] = 0, dist[B] = ∞, dist[C] = ∞, dist[D] = ∞</li>
              <li><strong>Итерация 1:</strong>
                <ul>
                  <li>A→B(1): dist[B] = 1</li>
                  <li>B→C(1): dist[C] = 2</li>
                  <li>C→D(1): dist[D] = 3</li>
                  <li>D→A(-4): 3 + (-4) = -1 → dist[A] = -1</li>
                </ul>
              </li>
              <li><strong>Итерация 2:</strong>
                <ul>
                  <li>A→B(1): (-1) + 1 = 0 → dist[B] = 0 (было 1)</li>
                  <li>B→C(1): 0 + 1 = 1 → dist[C] = 1 (было 2)</li>
                  <li>C→D(1): 1 + 1 = 2 → dist[D] = 2 (было 3) — <strong>D обновилось!</strong></li>
                  <li>D→A(-4): 2 + (-4) = -2 → dist[A] = -2</li>
                </ul>
              </li>
              <li><strong>Итерация 3:</strong> dist[D] = 1 (снова обновление)</li>
              <li><strong>Итерация 4:</strong> dist[D] = 0</li>
              <li><strong>Итерация 5:</strong> dist[D] = -1</li>
              <li><strong>И так далее...</strong> На каждой итерации dist[D] уменьшается на 1</li>
            </ol>

            <h4 style={{ marginTop: "1rem" }}>Математическое объяснение:</h4>
            <p>
              Каждый полный обход цикла <strong>A → B → C → D → A</strong> уменьшает расстояние до каждой вершины на <strong>|вес цикла| = 1</strong>.<br />
              Поскольку цикл <strong>отрицательный</strong> (-1), расстояние можно уменьшать <strong>бесконечно</strong>.
            </p>

            <div className="info-block info-block--red" style={{ marginBottom: 0 }}>
              <strong>Вывод:</strong> Кратчайшего пути не существует, так как можно бесконечно "наматывать" отрицательный цикл.
            </div>
          </div>
        </div>
      </details>

      <div className="info-block info-block--indigo">
        <h3>Визуализация отрицательного цикла:</h3>
        <div style={{ textAlign: "center", fontSize: "1.1rem" }}>
          <p>
            <span style={{ background: "#ffcdd2", padding: "4px 8px", borderRadius: "4px" }}>
              A → B (1) → C (1) → D (1) → A (-4)
            </span>
          </p>
          <p>
            <strong>Сумма весов цикла:</strong> 1 + 1 + 1 + (-4) = <strong style={{ color: "#c62828" }}>-1</strong>
          </p>
        </div>
      </div>

      <div className="answer-bar">
        <strong>Ответ:</strong>
        <div style={{ marginTop: "0.5rem" }}>
          <p style={{ margin: "0.2rem 0" }}>Бесконечно! Обнаружен отрицательный цикл:</p>
          <p style={{ margin: "0.2rem 0" }}>
            A → B → C → D → A
          </p>
          <p style={{ margin: "0.2rem 0" }}>
            (1 + 1 + 1 - 4 = -1)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultUpdates;
