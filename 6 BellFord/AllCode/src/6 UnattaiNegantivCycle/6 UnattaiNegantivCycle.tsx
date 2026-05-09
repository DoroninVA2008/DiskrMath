import React, { useState } from "react";

type Edge = {
  from: string;
  to: string;
  weight: number;
};

type ShortestPathResult = {
  vertex: string;
  distance: number;
  path: string[];
  reachable: boolean;
};

const UNegantivCycle: React.FC = () => {
  const edges: Edge[] = [
    { from: "A", to: "B", weight: 2 },
    { from: "B", to: "C", weight: 3 },
    { from: "X", to: "Y", weight: 1 },
    { from: "Y", to: "X", weight: -5 },
  ];

  const vertices = ["A", "B", "C", "X", "Y"];
  const start = "A";

  const findShortestPaths = (): ShortestPathResult[] => {
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

    const negativeCycleNodes = new Set<string>();
    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        let current = edge.to;
        const cycleNodes = new Set<string>();
        while (!cycleNodes.has(current)) {
          cycleNodes.add(current);
          current = prev[current]!;
          if (!current) break;
        }
        cycleNodes.forEach((node) => negativeCycleNodes.add(node));
      }
    }

    const results: ShortestPathResult[] = [];
    for (const v of vertices) {
      const path: string[] = [];
      let current: string | null = v;

      const visited = new Set<string>();
      while (current !== null && !visited.has(current)) {
        visited.add(current);
        path.unshift(current);
        current = prev[current];
      }

      const isInNegativeCycle = negativeCycleNodes.has(v);
      const isReachable = dist[v] !== Infinity;

      results.push({
        vertex: v,
        distance: isInNegativeCycle ? -Infinity : dist[v],
        path: isReachable && !isInNegativeCycle ? path : [],
        reachable: isReachable && !isInNegativeCycle,
      });
    }
    return results;
  };

  const [results] = useState<ShortestPathResult[]>(() => findShortestPaths());

  const formatPath = (path: string[]): string => {
    if (path.length === 0) return "Нет пути";
    if (path.length === 1 && path[0] === start) return start;
    return path.join(" → ");
  };

  const getDistanceDisplay = (result: ShortestPathResult): string => {
    if (!result.reachable) return "∞ (недостижима)";
    if (result.distance === -Infinity) return "-∞ (отрицательный цикл)";
    return result.distance.toString();
  };

  const reachableFromA = results.filter(r => r.reachable && r.vertex !== start);
  const unreachableVertices = results.filter(r => !r.reachable);

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Недостижимый отрицательный цикл</h2>
        <p>Граф содержит отрицательный цикл X ⇄ Y, но он недостижим из стартовой вершины A.</p>
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
          Стартовая вершина: <strong>A</strong>
        </div>
      </div>

      <div className="grid-2">
        <div className="info-block info-block--green" style={{ marginBottom: 0 }}>
          <h4>Достижимая компонента (из A)</h4>
          <p style={{ margin: 0 }}>
            A → B → C<br />
            <span style={{ fontSize: "0.9rem", color: "#555" }}>Нет отрицательных циклов</span>
          </p>
        </div>
        <div className="info-block info-block--red" style={{ marginBottom: 0 }}>
          <h4>Недостижимая компонента (из A)</h4>
          <p style={{ margin: 0 }}>
            X ⇄ Y (цикл с отрицательным весом)<br />
            <span style={{ fontSize: "0.9rem", color: "#555" }}>Вес цикла: 1 + (-5) = -4</span>
          </p>
        </div>
      </div>

      <div className="info-block info-block--green">
        <h3>РЕЗУЛЬТАТЫ (кратчайшие пути от A):</h3>

        <table className="bf-table">
          <thead>
            <tr>
              <th>Вершина</th>
              <th>Кратчайшее расстояние от A</th>
              <th>Путь</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => (
              <tr key={res.vertex}>
                <td>
                  <strong>{res.vertex}</strong>
                </td>
                <td className={!res.reachable ? "cell-neg" : ""}>
                  {getDistanceDisplay(res)}
                </td>
                <td>
                  {res.vertex === start ? "A" : formatPath(res.path)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="details-toggle">
        <summary>Пошаговое объяснение работы алгоритма</summary>
        <div className="details-body">
          <div className="info-block info-block--yellow" style={{ marginBottom: 0 }}>
            <h4>Алгоритм Беллмана–Форда от вершины A:</h4>
            <ol className="step-list">
              <li><strong>Инициализация:</strong> dist[A] = 0, все остальные = ∞</li>
              <li><strong>Итерация 1:</strong>
                <ul>
                  <li>Ребро A → B (2): dist[B] = 0 + 2 = 2</li>
                  <li>Ребро B → C (3): dist[C] = 2 + 3 = 5</li>
                  <li>Рёбра X→Y и Y→X: dist[X] = ∞, dist[Y] = ∞ → не обновляются</li>
                </ul>
              </li>
              <li><strong>Итерации 2-4:</strong> дальнейших улучшений нет (вершины X и Y остаются недостижимыми)</li>
              <li><strong>Проверка на отрицательные циклы:</strong>
                <ul>
                  <li>Цикл X → Y (1) и Y → X (-5): сумма = -4 (отрицательный)</li>
                  <li>Но он <strong>недостижим из A</strong>, поэтому не влияет на расстояния до A, B, C</li>
                </ul>
              </li>
            </ol>

            <h4 style={{ marginTop: "1rem" }}>Итоговые расстояния:</h4>
            <ul>
              <li><strong>A :</strong> 0</li>
              <li><strong>B :</strong> 2 (A → B)</li>
              <li><strong>C :</strong> 5 (A → B → C)</li>
              <li><strong>X :</strong> ∞ (недостижима из A)</li>
              <li><strong>Y :</strong> ∞ (недостижима из A)</li>
            </ul>
          </div>
        </div>
      </details>

      <div className="info-block info-block--red">
        <h3>Информация об отрицательном цикле:</h3>
        <p style={{ margin: "0.5rem 0" }}>
          <strong>Цикл:</strong> X → Y → X<br />
          <strong>Вес цикла:</strong> 1 + (-5) = <strong>-4</strong> (отрицательный)
        </p>
        <p style={{ margin: "0.5rem 0 0 0", fontStyle: "italic" }}>
          Этот цикл <strong>недостижим из вершины A</strong>, поэтому он не влияет на кратчайшие пути до A, B, C.<br />
          Вершины X и Y остаются недостижимыми (расстояние = ∞).
        </p>
      </div>

      <div className="answer-bar">
        <strong>Ответ (по условию задачи):</strong>
        <div style={{ marginTop: "0.5rem" }}>
          {results.map(res => (
            <div key={res.vertex}>
              <strong>{res.vertex} :</strong> {getDistanceDisplay(res)}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#718096" }}>
          Отрицательный цикл существует, но недостижим из A → X и Y остаются ∞
        </div>
      </div>
    </div>
  );
};

export default UNegantivCycle;
