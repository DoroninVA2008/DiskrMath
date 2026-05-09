import React, { useState } from "react";

type ShortestPathResult = {
  vertex: number;
  distance: number;
  path: number[];
};

const AdjacensMatrix: React.FC = () => {
  // Матрица смежности: строки - откуда, столбцы - куда
  const adjacencyMatrix: number[][] = [
    [0, 5, 0, 0],  // из 0
    [0, 0, -3, 0], // из 1
    [0, 0, 0, 4],  // из 2
    [2, 0, 0, 0],  // из 3
  ];

  const vertices = [0, 1, 2, 3];
  const start = 0;

  // Преобразование матрицы смежности в список рёбер
  const getEdgesFromMatrix = (): { from: number; to: number; weight: number }[] => {
    const edges: { from: number; to: number; weight: number }[] = [];
    for (let i = 0; i < adjacencyMatrix.length; i++) {
      for (let j = 0; j < adjacencyMatrix[i].length; j++) {
        if (adjacencyMatrix[i][j] !== 0) {
          edges.push({ from: i, to: j, weight: adjacencyMatrix[i][j] });
        }
      }
    }
    return edges;
  };

  const edges = getEdgesFromMatrix();

  const findShortestPaths = (): ShortestPathResult[] => {
    const dist: Record<number, number> = {};
    const prev: Record<number, number | null> = {};

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

    // Проверка на отрицательные циклы
    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        console.warn("Обнаружен цикл отрицательного веса!");
        break;
      }
    }

    // Восстановление путей
    const results: ShortestPathResult[] = [];
    for (const v of vertices) {
      const path: number[] = [];
      let current: number | null = v;
      while (current !== null) {
        path.unshift(current);
        current = prev[current];
      }
      results.push({
        vertex: v,
        distance: dist[v],
        path: path,
      });
    }
    return results;
  };

  const [results] = useState<ShortestPathResult[]>(() => findShortestPaths());

  const formatPath = (path: number[]): string => {
    if (path.length === 1 && path[0] === start) return `${start}`;
    if (path.length === 1) return `Нет пути из ${start} в ${path[0]}`;
    return path.join(" → ");
  };

  const getPathWeightCalculation = (path: number[]): string => {
    if (path.length < 2) return "";
    const weights: number[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(e => e.from === path[i] && e.to === path[i + 1]);
      if (edge) weights.push(edge.weight);
    }
    return weights.join(" + ");
  };

  const getPathTotalWeight = (path: number[]): number => {
    if (path.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(e => e.from === path[i] && e.to === path[i + 1]);
      if (edge) total += edge.weight;
    }
    return total;
  };

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Кратчайшие пути от вершины 0 (матрица смежности)</h2>
        <p>Алгоритм Беллмана–Форда на графе, заданном матрицей смежности 4×4.</p>
      </div>

      <div className="info-block info-block--blue" style={{ overflowX: "auto" }}>
        <h3>Матрица смежности:</h3>
        <table className="bf-table" style={{ margin: "0 auto", width: "auto" }}>
          <thead>
            <tr>
              <th>↓ От / К →</th>
              {vertices.map(v => (
                <th key={v}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adjacencyMatrix.map((row, i) => (
              <tr key={i}>
                <th>{i}</th>
                {row.map((cell, j) => (
                  <td key={j}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
          Стартовая вершина: <strong>0</strong>
        </div>
      </div>

      <div className="info-block info-block--gray">
        <h3>Список рёбер (из матрицы):</h3>
        <table className="bf-table">
          <thead>
            <tr>
              <th>От</th>
              <th>К</th>
              <th>Вес</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((edge, idx) => (
              <tr key={idx}>
                <td>{edge.from}</td>
                <td>{edge.to}</td>
                <td className={edge.weight < 0 ? "cell-neg" : ""}>{edge.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-block info-block--green">
        <h3>РЕЗУЛЬТАТЫ (кратчайшие пути от вершины 0):</h3>

        <table className="bf-table">
          <thead>
            <tr>
              <th>Вершина</th>
              <th>Кратчайшее расстояние</th>
              <th>Путь</th>
              <th>Проверка</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => (
              <tr key={res.vertex}>
                <td>
                  <strong>{res.vertex}</strong>
                </td>
                <td>
                  {res.distance === Infinity ? "∞ (недостижима)" : res.distance}
                </td>
                <td>
                  {formatPath(res.path)}
                </td>
                <td style={{ fontSize: "0.9rem", color: "#555" }}>
                  {res.path.length > 1 && (
                    <>
                      {getPathWeightCalculation(res.path)} = {getPathTotalWeight(res.path)}
                    </>
                  )}
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
            <h4>Алгоритм Беллмана–Форда:</h4>
            <ol className="step-list">
              <li><strong>Инициализация:</strong> dist[0] = 0, dist[1] = ∞, dist[2] = ∞, dist[3] = ∞</li>
              <li><strong>Итерация 1:</strong>
                <ul>
                  <li>Ребро 0 → 1 (5): dist[1] = 0 + 5 = 5</li>
                  <li>Ребро 1 → 2 (-3): 5 + (-3) = 2 → dist[2] = 2</li>
                  <li>Ребро 2 → 3 (4): 2 + 4 = 6 → dist[3] = 6</li>
                  <li>Ребро 3 → 0 (2): 6 + 2 = 8 &gt; 0 → не обновляем</li>
                </ul>
              </li>
              <li><strong>Итерация 2-3:</strong> дальнейших улучшений нет</li>
              <li><strong>Проверка на отрицательный цикл:</strong> не обнаружен</li>
            </ol>

            <h4 style={{ marginTop: "1rem" }}>Расчёт путей:</h4>
            <ul>
              <li><strong>Вершина 0:</strong> 0</li>
              <li><strong>Вершина 1:</strong> 5 (0 → 1)</li>
              <li><strong>Вершина 2:</strong> 2 (0 → 1 → 2, 5 + (-3) = 2)</li>
              <li><strong>Вершина 3:</strong> 6 (0 → 1 → 2 → 3, 5 - 3 + 4 = 6)</li>
            </ul>
          </div>
        </div>
      </details>

      <div className="info-block info-block--orange">
        <h3>Итоговый ответ:</h3>
        {results.map(res => (
          <p key={res.vertex} style={{ margin: "0.5rem 0", fontSize: "1rem" }}>
            <strong>{res.vertex} :</strong> {res.distance === Infinity ? "∞" : res.distance}
            {res.path.length > 1 && res.vertex !== start && (
              <span style={{ color: "#666" }}>
                {" "}
                ({formatPath(res.path)}, {getPathWeightCalculation(res.path)} = {getPathTotalWeight(res.path)})
              </span>
            )}
          </p>
        ))}
      </div>

      <div className="answer-bar">
        <strong>Результат соответствует условию задачи:</strong> 0:0, 1:5, 2:2 (0→1→2), 3:6 (0→1→2→3)
      </div>
    </div>
  );
};

export default AdjacensMatrix;
