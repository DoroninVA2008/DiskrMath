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
    <div style={{ fontFamily: "monospace", padding: "1rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>🛣️ Восстановление кратчайшего пути от A до D</h2>
      
      <div style={{ background: "#e3f2fd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
        <h3>📌 Граф:</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#90caf9" }}>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>От</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>К</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>Вес</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((e, idx) => (
              <tr key={idx}>
                <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{e.from}</td>
                <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{e.to}</td>
                <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{e.weight}</td>
               </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
          🎯 Старт: <strong>A</strong> | Цель: <strong>D</strong>
        </div>
      </div>

      {result.hasNegativeCycle && (
        <div style={{ background: "#ffebee", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "2px solid #f44336" }}>
          <strong style={{ color: "#c62828" }}>⚠️ ВНИМАНИЕ: Обнаружен цикл отрицательного веса!</strong>
        </div>
      )}

      <div style={{ 
        background: "#e8f5e9", 
        padding: "1.5rem", 
        borderRadius: "8px",
        marginBottom: "1rem",
        border: "3px solid #4caf50"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#2e7d32", textAlign: "center" }}>
          ✅ КРАТЧАЙШИЙ ПУТЬ НАЙДЕН
        </h3>
        
        {result.distance !== -1 ? (
          <>
            <div style={{ fontSize: "1.3rem", textAlign: "center", marginBottom: "1rem" }}>
              <strong>📏 Длина пути:</strong> {result.distance}
            </div>
            <div style={{ fontSize: "1.2rem", textAlign: "center", marginBottom: "1rem", background: "#fff", padding: "0.5rem", borderRadius: "4px" }}>
              <strong>🛤️ Путь:</strong> {formatPath(result.path)}
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

      <details style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
          🔍 Сравнение всех возможных путей из A в D
        </summary>
        <div style={{ marginTop: "1rem" }}>
          <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead style={{ background: "#ddd" }}>
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
                  <tr key={idx} style={isOptimal ? { background: "#c8e6c9", fontWeight: "bold" } : {}}>
                    <td>{alt.path.join(" → ")}</td>
                    <td>
                      {alt.path.map((v, i) => 
                        i < alt.path.length - 1 ? 
                        `${v}→${alt.path[i+1]}(${edges.find(e => e.from === v && e.to === alt.path[i+1])?.weight})` : ''
                      ).filter(x => x).join(" + ")}
                    </td>
                    <td style={{ textAlign: "center" }}>{alt.weight}</td>
                    <td style={{ textAlign: "center" }}>
                      {isOptimal ? "✅ Оптимальный" : "❌ Длиннее"}
                    </td>
                   </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>

      <details style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
          📊 Кратчайшие расстояния от A до всех вершин
        </summary>
        <div style={{ marginTop: "1rem" }}>
          <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead style={{ background: "#ddd" }}>
              <tr>
                <th>Вершина</th>
                <th>Расстояние от A</th>
                <th>Путь</th>
              </tr>
            </thead>
            <tbody>
              {vertices.map((v) => (
                <tr key={v} style={v === target ? { background: "#c8e6c9", fontWeight: "bold" } : {}}>
                  <td style={{ textAlign: "center" }}><strong>{v}</strong></td>
                  <td style={{ textAlign: "center" }}>
                    {result.allDistances[v] === Infinity ? "∞" : result.allDistances[v]}
                  </td>
                  <td>{formatPath(result.allPaths[v])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div style={{ background: "#fff3e0", padding: "1rem", borderRadius: "8px" }}>
        <h3>📝 Пошаговое объяснение:</h3>
        <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Инициализация:</strong> dist[A] = 0, dist[B] = ∞, dist[C] = ∞, dist[D] = ∞</li>
          <li><strong>Ребро A → B (3):</strong> dist[B] = 0 + 3 = 3, prev[B] = A</li>
          <li><strong>Ребро A → C (5):</strong> dist[C] = 5, prev[C] = A</li>
          <li><strong>Ребро B → C (-2):</strong> 3 + (-2) = 1 &lt; 5 → dist[C] = 1, prev[C] = B</li>
          <li><strong>Ребро B → D (1):</strong> 3 + 1 = 4 → dist[D] = 4, prev[D] = B</li>
          <li><strong>Ребро C → D (4):</strong> 1 + 4 = 5 &gt; 4 → не обновляем</li>
        </ol>
        <p style={{ marginTop: "1rem", marginBottom: 0, background: "#fff", padding: "0.5rem", borderRadius: "4px" }}>
          <strong>✨ Оптимальный путь:</strong> A → B → D, длина = 3 + 1 = <strong>4</strong>
        </p>
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center", padding: "1rem", background: "#f0f0f0", borderRadius: "8px" }}>
        <strong>🎯 Ответ (по условию задачи):</strong>
        <div style={{ marginTop: "0.5rem" }}>
          <div>Длина: <strong style={{ fontSize: "1.2rem", color: "#2e7d32" }}>{result.distance}</strong></div>
          <div>Путь: <strong>{formatPath(result.path)}</strong></div>
          <div style={{ fontSize: "0.9rem", color: "#555" }}>({getPathCalculation(result.path)} = {result.distance})</div>
        </div>
      </div>
    </div>
  );
};

export default RestorPath;