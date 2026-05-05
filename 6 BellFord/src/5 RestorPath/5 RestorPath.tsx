import React, { useState } from "react";

type Edge = {
  from: string;
  to: string;
  weight: number;
};

type ShortestPathResult = {
  distance: number;
  path: string[];
  allDistances: Record<string, number>;
  allPaths: Record<string, string[]>;
  hasNegativeCycle: boolean;
};

const RestorPath: React.FC = () => {
  const edges: Edge[] = [
    { from: "A", to: "B", weight: 3 },
    { from: "A", to: "C", weight: 5 },
    { from: "B", to: "C", weight: -2 },
    { from: "B", to: "D", weight: 1 },
    { from: "C", to: "D", weight: 4 },
  ];

  const vertices = ["A", "B", "C", "D"];
  const start = "A";
  const target = "D";

  const findShortestPath = (): ShortestPathResult => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};

    vertices.forEach((v) => {
      dist[v] = Infinity;
      prev[v] = null;
    });
    dist[start] = 0;

    for (let i = 0; i < vertices.length - 1; i++) {
      for (const edge of edges) {
        if (dist[edge.from] + edge.weight < dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + edge.weight;
          prev[edge.to] = edge.from;
        }
      }
    }

    let hasNegativeCycle = false;
    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        hasNegativeCycle = true;
        break;
      }
    }

    const allPaths: Record<string, string[]> = {};
    for (const v of vertices) {
      const path: string[] = [];
      let current: string | null = v;
      while (current !== null) {
        path.unshift(current);
        current = prev[current];
      }
      allPaths[v] = path;
    }

    const pathToD: string[] = [];
    let current: string | null = target;
    while (current !== null) {
      pathToD.unshift(current);
      current = prev[current];
    }

    const finalDistance = dist[target] === Infinity ? -1 : dist[target];

    return {
      distance: finalDistance,
      path: pathToD,
      allDistances: dist,
      allPaths: allPaths,
      hasNegativeCycle,
    };
  };

  const [result] = useState<ShortestPathResult>(() => findShortestPath());

  const calculatePathWeight = (path: string[]): number => {
    if (path.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(
        (e) => e.from === path[i] && e.to === path[i + 1]
      );
      if (edge) total += edge.weight;
    }
    return total;
  };

  const formatPath = (path: string[]): string => {
    if (path.length === 1 && path[0] === start) return start;
    if (path.length === 1) return `Нет пути из ${start} в ${path[0]}`;
    return path.join(" → ");
  };

  const getPathCalculation = (path: string[]): string => {
    if (path.length < 2) return "";
    const calculations: string[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(
        (e) => e.from === path[i] && e.to === path[i + 1]
      );
      if (edge) {
        calculations.push(`${path[i]} → ${path[i+1]} (${edge.weight})`);
      }
    }
    return calculations.join(" + ");
  };

  const alternativePaths = [
    { path: ["A", "B", "D"], weight: 3 + 1 },
    { path: ["A", "C", "D"], weight: 5 + 4 },
    { path: ["A", "B", "C", "D"], weight: 3 + (-2) + 4 },
  ];

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Восстановление кратчайшего пути от A до D</h2>
        <p>Поиск оптимального пути с использованием массива предшественников prev[].</p>
      </div>

      <div className="info-block info-block--blue">
        <h3>Граф:</h3>
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
          Старт: <strong>A</strong> | Цель: <strong>D</strong>
        </div>
      </div>

      {result.hasNegativeCycle && (
        <div className="info-block info-block--red">
          <strong>ВНИМАНИЕ: Обнаружен цикл отрицательного веса!</strong>
        </div>
      )}

      <div className="info-block info-block--green">
        <h3 style={{ textAlign: "center" }}>
          КРАТЧАЙШИЙ ПУТЬ НАЙДЕН
        </h3>

        {result.distance !== -1 ? (
          <>
            <div style={{ fontSize: "1.3rem", textAlign: "center", marginBottom: "1rem" }}>
              <strong>Длина пути:</strong> {result.distance}
            </div>
            <div style={{ fontSize: "1.2rem", textAlign: "center", marginBottom: "1rem", background: "#fff", padding: "0.5rem", borderRadius: "4px" }}>
              <strong>Путь:</strong> {formatPath(result.path)}
            </div>
            <div style={{ textAlign: "center", color: "#555", fontStyle: "italic" }}>
              {getPathCalculation(result.path)} = {result.distance}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "#c62828" }}>
            Путь из A в D не существует
          </div>
        )}
      </div>

      <details className="details-toggle">
        <summary>Сравнение всех возможных путей из A в D</summary>
        <div className="details-body">
          <table className="bf-table">
            <thead>
              <tr>
                <th>Путь</th>
                <th>Расчёт</th>
                <th>Общая длина</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {alternativePaths.map((alt, idx) => {
                const isOptimal = alt.weight === result.distance &&
                                  JSON.stringify(alt.path) === JSON.stringify(result.path);
                return (
                  <tr key={idx} className={isOptimal ? "row-green" : ""}>
                    <td>{alt.path.join(" → ")}</td>
                    <td>
                      {alt.path.map((v, i) =>
                        i < alt.path.length - 1 ?
                        `${v}→${alt.path[i+1]}(${edges.find(e => e.from === v && e.to === alt.path[i+1])?.weight})` : ''
                      ).filter(x => x).join(" + ")}
                    </td>
                    <td>{alt.weight}</td>
                    <td>
                      {isOptimal ? "Оптимальный" : "Длиннее"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>

      <details className="details-toggle">
        <summary>Кратчайшие расстояния от A до всех вершин</summary>
        <div className="details-body">
          <table className="bf-table">
            <thead>
              <tr>
                <th>Вершина</th>
                <th>Расстояние от A</th>
                <th>Путь</th>
              </tr>
            </thead>
            <tbody>
              {vertices.map((v) => (
                <tr key={v} className={v === target ? "row-green" : ""}>
                  <td><strong>{v}</strong></td>
                  <td>
                    {result.allDistances[v] === Infinity ? "∞" : result.allDistances[v]}
                  </td>
                  <td>{formatPath(result.allPaths[v])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="info-block info-block--orange">
        <h3>Пошаговое объяснение:</h3>
        <ol className="step-list">
          <li><strong>Инициализация:</strong> dist[A] = 0, dist[B] = ∞, dist[C] = ∞, dist[D] = ∞</li>
          <li><strong>Ребро A → B (3):</strong> dist[B] = 0 + 3 = 3, prev[B] = A</li>
          <li><strong>Ребро A → C (5):</strong> dist[C] = 5, prev[C] = A</li>
          <li><strong>Ребро B → C (-2):</strong> 3 + (-2) = 1 &lt; 5 → dist[C] = 1, prev[C] = B</li>
          <li><strong>Ребро B → D (1):</strong> 3 + 1 = 4 → dist[D] = 4, prev[D] = B</li>
          <li><strong>Ребро C → D (4):</strong> 1 + 4 = 5 &gt; 4 → не обновляем</li>
        </ol>
        <p style={{ marginTop: "1rem", marginBottom: 0, background: "#fff", padding: "0.5rem", borderRadius: "4px" }}>
          <strong>Оптимальный путь:</strong> A → B → D, длина = 3 + 1 = <strong>4</strong>
        </p>
      </div>

      <div className="answer-bar">
        <strong>Ответ (по условию задачи):</strong>
        <div style={{ marginTop: "0.5rem" }}>
          <div>Длина: <strong style={{ fontSize: "1.2rem" }}>{result.distance}</strong></div>
          <div>Путь: <strong>{formatPath(result.path)}</strong></div>
          <div style={{ fontSize: "0.9rem", color: "#718096" }}>({getPathCalculation(result.path)} = {result.distance})</div>
        </div>
      </div>
    </div>
  );
};

export default RestorPath;
