import React, { useState } from "react";

type Edge = {
  from: string;
  to: string;
  weight: number;
};

type Result = {
  hasNegativeCycle: boolean;
  distances: Record<string, number>;
  iterations?: {
    step: number;
    distances: Record<string, number>;
    relaxingEdge?: string;
  }[];
};

const NegantiveCycle: React.FC = () => {
  const edges: Edge[] = [
    { from: "A", to: "B", weight: 1 },
    { from: "B", to: "C", weight: -1 },
    { from: "C", to: "A", weight: -1 },
  ];

  const vertices = ["A", "B", "C"];
  const start = "A";

  const detectNegativeCycle = (): Result => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const iterationsLog: {
      step: number;
      distances: Record<string, number>;
      relaxingEdge?: string;
    }[] = [];

    // Инициализация
    vertices.forEach((v) => {
      dist[v] = Infinity;
      prev[v] = null;
    });
    dist[start] = 0;

    // Логируем начальное состояние
    iterationsLog.push({
      step: 0,
      distances: { ...dist },
    });

    // Релаксация рёбер |V|-1 раз
    for (let i = 0; i < vertices.length - 1; i++) {
      let relaxed = false;
      for (const edge of edges) {
        if (dist[edge.from] + edge.weight < dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + edge.weight;
          prev[edge.to] = edge.from;
          relaxed = true;
          
          // Логируем каждую релаксацию
          iterationsLog.push({
            step: i + 1,
            distances: { ...dist },
            relaxingEdge: `${edge.from} → ${edge.to} (вес ${edge.weight})`,
          });
        }
      }
      if (!relaxed) break;
    }

    // Проверка на отрицательный цикл (дополнительная итерация)
    let hasCycle = false;
    let cycleEdges: string[] = [];
    
    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        hasCycle = true;
        cycleEdges.push(`${edge.from} → ${edge.to} (вес ${edge.weight})`);
        
        // Находим вершины в цикле
        const cycleVertices: string[] = [];
        let current = edge.to;
        const visited = new Set<string>();
        
        while (!visited.has(current)) {
          visited.add(current);
          cycleVertices.unshift(current);
          current = prev[current]!;
          if (!current) break;
        }
        cycleVertices.unshift(current);
        
        iterationsLog.push({
          step: vertices.length,
          distances: { ...dist },
          relaxingEdge: `⚠️ Отрицательный цикл: ${cycleVertices.join(" → ")} → ${edge.to}`,
        });
        break;
      }
    }

    return {
      hasNegativeCycle: hasCycle,
      distances: dist,
      iterations: iterationsLog,
    };
  };

  const [result, setResult] = useState<Result>(() => detectNegativeCycle());

  const getDistanceDisplay = (distance: number): string => {
    if (distance === Infinity) return "∞";
    return distance.toString();
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
      <h2>🔍 Обнаружение цикла отрицательного веса</h2>
      
      <div style={{ background: "#e3f2fd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
        <h3>📌 Граф для проверки:</h3>
        <pre style={{ margin: 0 }}>
          {edges.map((e, idx) => (
            <div key={idx}>
              {e.from} → {e.to} : вес {e.weight}
            </div>
          ))}
        </pre>
        <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
          Стартовая вершина: <strong>A</strong>
        </div>
      </div>

      <div style={{ 
        background: result.hasNegativeCycle ? "#ffebee" : "#e8f5e9", 
        padding: "1rem", 
        borderRadius: "8px",
        marginBottom: "1rem",
        border: `2px solid ${result.hasNegativeCycle ? "#f44336" : "#4caf50"}`
      }}>
        <h3 style={{ margin: 0, color: result.hasNegativeCycle ? "#c62828" : "#2e7d32" }}>
          {result.hasNegativeCycle ? "⚠️ ЦИКЛ ОТРИЦАТЕЛЬНОГО ВЕСА ОБНАРУЖЕН" : "✅ Цикл отрицательного веса не обнаружен"}
        </h3>
        {result.hasNegativeCycle && (
          <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>
            В графе присутствует цикл A → B → C → A с суммой весов: 1 + (-1) + (-1) = <strong>-1</strong> (отрицательный)
          </p>
        )}
      </div>

      <details style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
          📊 Показать пошаговую работу алгоритма Беллмана–Форда
        </summary>
        <div style={{ marginTop: "1rem" }}>
          <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead style={{ background: "#ddd" }}>
              <tr>
                <th>Шаг</th>
                <th>Релаксируемое ребро</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
              </tr>
            </thead>
            <tbody>
              {result.iterations?.map((iter, idx) => (
                <tr key={idx} style={iter.relaxingEdge?.includes("Отрицательный") ? { background: "#ffcdd2" } : {}}>
                  <td>{iter.step}</td>
                  <td>{iter.relaxingEdge || "Инициализация"}</td>
                  <td>{getDistanceDisplay(iter.distances["A"])}</td>
                  <td>{getDistanceDisplay(iter.distances["B"])}</td>
                  <td>{getDistanceDisplay(iter.distances["C"])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div style={{ background: "#fff3e0", padding: "1rem", borderRadius: "8px" }}>
        <h3>📝 Объяснение:</h3>
        <ul>
          <li>Алгоритм Беллмана–Форда выполняет релаксацию всех рёбер |V|-1 = 2 раза</li>
          <li>После этого выполняется дополнительная (3-я) итерация для проверки</li>
          <li>Если на 3-й итерации расстояние можно уменьшить — есть отрицательный цикл</li>
          <li>В данном графе: A → B (1) → C (-1) → A (-1) = -1 (отрицательный цикл)</li>
        </ul>
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
        <strong>Ответ:</strong> Обнаружен цикл отрицательного веса: <strong style={{ color: "#f44336" }}>{result.hasNegativeCycle ? "True" : "False"}</strong>
      </div>
    </div>
  );
};

export default NegantiveCycle;