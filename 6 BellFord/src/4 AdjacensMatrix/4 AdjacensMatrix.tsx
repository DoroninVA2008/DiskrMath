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
    <div style={{ fontFamily: "monospace", padding: "1rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>📊 Кратчайшие пути от вершины 0 (матрица смежности)</h2>
      
      <div style={{ background: "#e3f2fd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", overflowX: "auto" }}>
        <h3>📌 Матрица смежности:</h3>
        <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px", border: "1px solid #ccc", background: "#90caf9" }}>↓ От / К →</th>
              {vertices.map(v => (
                <th key={v} style={{ padding: "8px", border: "1px solid #ccc", background: "#90caf9" }}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adjacencyMatrix.map((row, i) => (
              <tr key={i}>
                <th style={{ padding: "8px", border: "1px solid #ccc", background: "#90caf9" }}>{i}</th>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>
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

      <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
        <h3>🌉 Список рёбер (из матрицы):</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#ddd" }}>
              <th style={{ padding: "4px", border: "1px solid #ccc" }}>От</th>
              <th style={{ padding: "4px", border: "1px solid #ccc" }}>К</th>
              <th style={{ padding: "4px", border: "1px solid #ccc" }}>Вес</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((edge, idx) => (
              <tr key={idx}>
                <td style={{ padding: "4px", border: "1px solid #ccc", textAlign: "center" }}>{edge.from}</td>
                <td style={{ padding: "4px", border: "1px solid #ccc", textAlign: "center" }}>{edge.to}</td>
                <td style={{ padding: "4px", border: "1px solid #ccc", textAlign: "center" }}>{edge.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: "#e8f5e9", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "2px solid #4caf50" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#2e7d32" }}>✅ РЕЗУЛЬТАТЫ (кратчайшие пути от вершины 0):</h3>
        
        <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ background: "#c8e6c9" }}>
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
                <td style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {res.vertex}
                </td>
                <td style={{ textAlign: "center" }}>
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

      <details style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
          🔍 Пошаговое объяснение работы алгоритма
        </summary>
        <div style={{ marginTop: "1rem", background: "#fffde7", padding: "1rem", borderRadius: "8px" }}>
          <h4>Алгоритм Беллмана–Форда:</h4>
          <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
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
          
          <h4 style={{ marginTop: "1rem" }}>📐 Расчёт путей:</h4>
          <ul>
            <li><strong>Вершина 0:</strong> 0</li>
            <li><strong>Вершина 1:</strong> 5 (0 → 1)</li>
            <li><strong>Вершина 2:</strong> 2 (0 → 1 → 2, 5 + (-3) = 2)</li>
            <li><strong>Вершина 3:</strong> 6 (0 → 1 → 2 → 3, 5 - 3 + 4 = 6)</li>
          </ul>
        </div>
      </details>

      <div style={{ background: "#fff3e0", padding: "1rem", borderRadius: "8px" }}>
        <h3>📝 Итоговый ответ:</h3>
        {results.map(res => (
          <p key={res.vertex} style={{ margin: "0.5rem 0", fontFamily: "monospace", fontSize: "1rem" }}>
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

      <div style={{ marginTop: "1rem", textAlign: "center", padding: "0.5rem", background: "#f0f0f0", borderRadius: "8px", fontSize: "0.9rem" }}>
        <strong>🎯 Результат соответствует условию задачи:</strong> 0:0, 1:5, 2:2 (0→1→2), 3:6 (0→1→2→3)
      </div>
    </div>
  );
};

export default AdjacensMatrix;