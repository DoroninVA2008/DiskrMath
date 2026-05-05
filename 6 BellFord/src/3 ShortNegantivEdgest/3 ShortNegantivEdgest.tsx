import React, { useState } from "react"

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

const ShortNegantivEdgest: React.FC = () => {
  const edges: Edge[] = [
    { from: "S", to: "A", weight: 4 },
    { from: "S", to: "B", weight: 3 },
    { from: "A", to: "B", weight: -2 },
    { from: "B", to: "A", weight: 1 },
    { from: "B", to: "C", weight: 2 },
    { from: "C", to: "F", weight: 1 },
    { from: "A", to: "F", weight: 5 },
  ];

  const vertices = ["S", "A", "B", "C", "F"];
  const start = "S";
  const target = "F";

  const findShortestPath = (): ShortestPathResult => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};

    // Инициализация
    vertices.forEach((v) => {
      dist[v] = Infinity;
      prev[v] = null;
    });
    dist[start] = 0;

    // Релаксация рёбер |V|-1 раз
    for (let i = 0; i < vertices.length - 1; i++) {
      for (const edge of edges) {
        if (dist[edge.from] + edge.weight < dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + edge.weight;
          prev[edge.to] = edge.from;
        }
      }
    }

    // Проверка на отрицательный цикл
    let hasNegativeCycle = false;
    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        hasNegativeCycle = true;
        break;
      }
    }

    // Восстановление всех путей
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

    // Восстановление пути до F
    const pathToF: string[] = [];
    let current: string | null = target;
    while (current !== null) {
      pathToF.unshift(current);
      current = prev[current];
    }

    // Проверка на достижимость
    const finalDistance = dist[target] === Infinity ? -1 : dist[target];

    return {
      distance: finalDistance,
      path: pathToF,
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

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Кратчайший путь от S до F (с отрицательными рёбрами)</h2>
        <p>Алгоритм Беллмана–Форда корректно обрабатывает рёбра с отрицательным весом.</p>
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
          Старт: <strong>S</strong> | Цель: <strong>F</strong>
        </div>
      </div>

      {result.hasNegativeCycle && (
        <div className="info-block info-block--red">
          <strong>ВНИМАНИЕ: Обнаружен цикл отрицательного веса!</strong>
          <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>Кратчайший путь может быть не определён.</p>
        </div>
      )}

      <div className={`info-block ${result.distance !== -1 ? "info-block--green" : "info-block--red"}`}>
        <h3>
          {result.distance !== -1 ? "КРАТЧАЙШИЙ ПУТЬ НАЙДЕН" : "Путь не существует"}
        </h3>

        {result.distance !== -1 && (
          <>
            <p style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
              <strong>Длина пути:</strong> {result.distance}
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Путь:</strong> {formatPath(result.path)}
            </p>
            <p style={{ margin: "0.5rem 0", color: "#555", fontStyle: "italic" }}>
              Проверка: {result.path.join(" → ")} = {result.path.map((v, idx) =>
                idx < result.path.length - 1 ?
                `${v}${edges.find(e => e.from === v && e.to === result.path[idx + 1])?.weight !== undefined ?
                `(${edges.find(e => e.from === v && e.to === result.path[idx + 1])!.weight})` : ''} → ` :
                v
              ).join('')}
              = {calculatePathWeight(result.path)}
            </p>
            <div className="info-block info-block--gray" style={{ marginBottom: 0 }}>
              <strong>Расчёт:</strong> {result.path.map((v, i) =>
                i < result.path.length - 1 ?
                `${v} → ${result.path[i+1]} (${edges.find(e => e.from === v && e.to === result.path[i+1])?.weight})` : ''
              ).filter(x => x).join(' + ')} = {calculatePathWeight(result.path)}
            </div>
          </>
        )}
      </div>

      <details className="details-toggle">
        <summary>Кратчайшие расстояния от S до всех вершин</summary>
        <div className="details-body">
          <table className="bf-table">
            <thead>
              <tr>
                <th>Вершина</th>
                <th>Расстояние от S</th>
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
          <li>Начинаем из S: расстояние до S = 0, остальные ∞</li>
          <li>Ребро S → A (4): dist[A] = 4</li>
          <li>Ребро S → B (3): dist[B] = 3</li>
          <li>Ребро A → B (-2): 4 + (-2) = 2 &lt; 3 → обновляем dist[B] = 2, prev[B] = A</li>
          <li>Ребро B → C (2): 2 + 2 = 4 → dist[C] = 4, prev[C] = B</li>
          <li>Ребро C → F (1): 4 + 1 = 5 → dist[F] = 5, prev[F] = C</li>
          <li>Ребро A → F (5): 4 + 5 = 9 &gt; 5 → не обновляем</li>
        </ol>
        <p style={{ marginTop: "1rem", marginBottom: 0 }}>
          <strong>Оптимальный путь:</strong> S → A → B → C → F, длина = 4 + (-2) + 2 + 1 = <strong>5</strong>
        </p>
      </div>

      <div className="answer-bar">
        <strong>Ответ:</strong> Длина: {result.distance}, Путь: {formatPath(result.path)}
      </div>
    </div>
  );
};

export default ShortNegantivEdgest;
