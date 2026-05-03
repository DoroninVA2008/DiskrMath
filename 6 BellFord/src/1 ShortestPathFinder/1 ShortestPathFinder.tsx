import React, { useState } from "react";

type Edge = {
  from: string;
  to: string;
  weight: number;
};

type Result = {
  vertex: string;
  distance: number;
  path: string[];
};

const ShortestPathFinder: React.FC = () => {
  const edges: Edge[] = [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "B", to: "C", weight: -1 },
    { from: "B", to: "D", weight: 5 },
    { from: "C", to: "D", weight: 8 },
    { from: "C", to: "E", weight: 10 },
    { from: "D", to: "E", weight: 2 },
  ];

  const vertices = ["A", "B", "C", "D", "E"];
  const start = "A";

  const findShortestPaths = (): Result[] => {
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

    // Проверка на отрицательные циклы (не обязательна, но для надёжности)
    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        console.warn("Отрицательный цикл найден!");
        break;
      }
    }

    // Восстановление путей
    const results: Result[] = [];
    for (const v of vertices) {
      const path: string[] = [];
      let current: string | null = v;
      while (current !== null) {
        path.unshift(current);
        current = prev[current];
      }
      results.push({
        vertex: v,
        distance: dist[v],
        path,
      });
    }
    return results;
  };

  const [results, setResults] = useState<Result[]>(() => findShortestPaths());

  const getPathString = (path: string[]): string => {
    if (path.length === 1 && path[0] === start) return start;
    if (path.length === 1) return `Нет пути из ${start} в ${path[0]}`;
    return path.join(" → ");
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <h2>📐 Кратчайшие пути от вершины A</h2>
      <h3>📌 Рёбра графа:</h3>
      <pre>
        {edges.map((e, idx) => (
          <div key={idx}>
            {e.from} → {e.to} : вес {e.weight}
          </div>
        ))}
      </pre>

      <h3>✅ Результаты (алгоритм Беллмана–Форда):</h3>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
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
              <td>
                {res.distance === Infinity
                  ? "∞ (недостижима)"
                  : res.distance}
              </td>
              <td>{getPathString(res.path)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem", background: "#f4f4f4", padding: "0.5rem" }}>
        <strong>📝 Примечание:</strong>
        <ul>
          <li>A → C: A → B → C (4 + (-1) = 3)</li>
          <li>A → D: A → B → D (4 + 5 = 9)</li>
          <li>A → E: A → B → D → E (4 + 5 + 2 = 11)</li>
        </ul>
      </div>
    </div>
  );
};

export default ShortestPathFinder;