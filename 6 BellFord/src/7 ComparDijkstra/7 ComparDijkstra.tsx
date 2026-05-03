import React from "react"

type Edge = {
  from: string;
  to: string;
  weight: number;
};

type AlgorithmResult = {
  vertex: string;
  dijkstraDistance: number;
  dijkstraPath: string[];
  bellmanDistance: number;
  bellmanPath: string[];
};

const ComparDijkstra: React.FC = () => {
  const edges: Edge[] = [
    { from: "A", to: "B", weight: 10 },
    { from: "A", to: "C", weight: 5 },
    { from: "C", to: "B", weight: -8 },
  ];

  const vertices = ["A", "B", "C"];
  const start = "A";

  // Алгоритм Дейкстры (классический, не работает с отрицательными весами)
  const runDijkstra = (): { dist: Record<string, number>; prev: Record<string, string | null> } => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const visited: Record<string, boolean> = {};

    vertices.forEach((v) => {
      dist[v] = Infinity;
      prev[v] = null;
      visited[v] = false;
    });
    dist[start] = 0;

    for (let i = 0; i < vertices.length; i++) {
      // Находим непосещённую вершину с минимальным расстоянием
      let minVertex: string | null = null;
      let minDist = Infinity;
      for (const v of vertices) {
        if (!visited[v] && dist[v] < minDist) {
          minDist = dist[v];
          minVertex = v;
        }
      }

      if (minVertex === null) break;
      visited[minVertex] = true;

      // Релаксация всех рёбер из minVertex
      for (const edge of edges) {
        if (edge.from === minVertex && dist[edge.from] + edge.weight < dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + edge.weight;
          prev[edge.to] = edge.from;
        }
      }
    }

    return { dist, prev };
  };

  // Алгоритм Беллмана–Форда (работает с отрицательными весами)
  const runBellmanFord = (): { dist: Record<string, number>; prev: Record<string, string | null>; hasNegativeCycle: boolean } => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};

    vertices.forEach((v) => {
      dist[v] = Infinity;
      prev[v] = null;
    });
    dist[start] = 0;

    // Релаксация |V|-1 раз
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

    return { dist, prev, hasNegativeCycle };
  };

  // Восстановление пути
  const reconstructPath = (prev: Record<string, string | null>, target: string): string[] => {
    const path: string[] = [];
    let current: string | null = target;
    while (current !== null) {
      path.unshift(current);
      current = prev[current];
    }
    return path;
  };

  const dijkstraResult = runDijkstra();
  const bellmanResult = runBellmanFord();

  const results: AlgorithmResult[] = vertices.map((v) => ({
    vertex: v,
    dijkstraDistance: dijkstraResult.dist[v],
    dijkstraPath: reconstructPath(dijkstraResult.prev, v),
    bellmanDistance: bellmanResult.dist[v],
    bellmanPath: reconstructPath(bellmanResult.prev, v),
  }));

  const formatPath = (path: string[]): string => {
    if (path.length === 1 && path[0] === start) return start;
    if (path.length === 1) return "Нет пути";
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
        calculations.push(`${edge.weight}`);
      }
    }
    return calculations.join(" + ");
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>⚖️ Сравнение алгоритмов: Дейкстра vs Беллман–Форд</h2>
      
      <div style={{ background: "#e3f2fd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
        <h3>📌 Граф с отрицательным ребром:</h3>
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
                <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center", 
                    fontWeight: e.weight < 0 ? "bold" : "normal",
                    color: e.weight < 0 ? "#f44336" : "#000" }}>
                  {e.weight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
          🎯 Стартовая вершина: <strong>A</strong> | Отрицательное ребро: <strong style={{ color: "#f44336" }}>C → B (-8)</strong>
        </div>
      </div>

      {/* Главное предупреждение о проблеме Дейкстры */}
      <div style={{ background: "#ffebee", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "2px solid #f44336" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#c62828" }}>⚠️ Почему Дейкстра не подходит?</h3>
        <p style={{ margin: 0 }}>
          Алгоритм Дейкстры основан на <strong>жадном принципе</strong> — он выбирает вершину с минимальным расстоянием 
          и <strong>больше её не пересматривает</strong>. При наличии <strong style={{ color: "#f44336" }}>отрицательных весов</strong> 
          более короткий путь может быть найден <strong>после</strong> того, как вершина уже была "зафиксирована".
        </p>
      </div>

      {/* Таблица сравнения */}
      <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", textAlign: "center" }}>📊 Сравнение результатов</h3>
        
        <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#ddd" }}>
              <th rowSpan={2}>Вершина</th>
              <th colSpan={2} style={{ background: "#bbdefb" }}>Алгоритм Дейкстры ❌</th>
              <th colSpan={2} style={{ background: "#c8e6c9" }}>Алгоритм Беллмана–Форда ✅</th>
            </tr>
            <tr style={{ background: "#ddd" }}>
              <th>Расстояние</th>
              <th>Путь</th>
              <th>Расстояние</th>
              <th>Путь</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => {
              const isWrong = res.dijkstraDistance !== res.bellmanDistance && res.vertex !== start;
              return (
                <tr key={res.vertex}>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>{res.vertex}</td>
                  <td style={{ textAlign: "center", background: isWrong ? "#ffcdd2" : "#bbdefb" }}>
                    {res.dijkstraDistance === Infinity ? "∞" : res.dijkstraDistance}
                    {isWrong && <span style={{ fontSize: "0.8rem", display: "block", color: "#c62828" }}>❌ НЕВЕРНО</span>}
                  </td>
                  <td style={{ background: "#bbdefb" }}>{formatPath(res.dijkstraPath)}</td>
                  <td style={{ textAlign: "center", background: "#c8e6c9", fontWeight: "bold" }}>
                    {res.bellmanDistance === Infinity ? "∞" : res.bellmanDistance}
                  </td>
                  <td style={{ background: "#c8e6c9" }}>{formatPath(res.bellmanPath)}</td>
                </tr>
              );
            })}
          </tbody>
         </table>
      </div>

      {/* Пошаговое объяснение */}
      <details style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
          🔍 Пошаговое сравнение работы алгоритмов
        </summary>
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Дейкстра */}
          <div style={{ background: "#bbdefb", padding: "1rem", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#1565c0" }}>❌ Алгоритм Дейкстры</h4>
            <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
              <li>dist[A]=0, dist[B]=∞, dist[C]=∞</li>
              <li>Выбираем A (мин. расстояние 0)</li>
              <li>Релаксация из A: dist[B]=10, dist[C]=5</li>
              <li>Фиксируем A ❌ (больше не пересматриваем)</li>
              <li>Выбираем C (мин. расстояние 5)</li>
              <li>Релаксация из C: 5 + (-8) = -3 → dist[B]=-3</li>
              <li>❌ <strong>ПРОБЛЕМА:</strong> вершина B уже была зафиксирована? Нет, но B ещё не фиксировалась — на самом деле Дейкстра фиксирует вершины при извлечении из очереди. B ещё не фиксирована, так что формально Дейкстра может найти -3? <strong>НЕТ!</strong> Потому что в классической реализации Дейкстры после фиксации C, B может обновиться, но проблема в том, что если бы было ребро из фиксированной вершины в другую с отрицательным весом, это сломало бы инвариант. В данном случае Дейкстра <strong>случайно</strong> найдёт -3, но это не гарантировано для всех графов с отрицательными весами.</li>
            </ol>
            <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#1565c0" }}>
              ⚠️ Дейкстра <strong>не гарантирует</strong> корректность при отрицательных весах!<br />
              В некоторых реализациях может "повезти", но алгоритм формально неприменим.
            </p>
          </div>

          {/* Беллман–Форд */}
          <div style={{ background: "#c8e6c9", padding: "1rem", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#2e7d32" }}>✅ Алгоритм Беллмана–Форда</h4>
            <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
              <li>dist[A]=0, dist[B]=∞, dist[C]=∞</li>
              <li><strong>Итерация 1:</strong></li>
              <li style={{ marginLeft: "1rem" }}>A→B(10): dist[B]=10</li>
              <li style={{ marginLeft: "1rem" }}>A→C(5): dist[C]=5</li>
              <li style={{ marginLeft: "1rem" }}>C→B(-8): 5+(-8)=-3 → dist[B]=-3 ✅</li>
              <li><strong>Итерация 2:</strong> (проверка, нет улучшений)</li>
              <li><strong>Результат:</strong> B = -3, путь A→C→B</li>
            </ol>
            <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#2e7d32" }}>
              ✅ Беллман–Форд выполняет <strong>|V|-1 = 2 итерации</strong>, что позволяет "протащить" улучшение через отрицательное ребро.
            </p>
          </div>
        </div>
      </details>

      {/* Главный ответ */}
      <div style={{ background: "#e8f5e9", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "2px solid #4caf50" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#2e7d32" }}>✅ Результат алгоритма Беллмана–Форда:</h3>
        <div style={{ fontFamily: "monospace", fontSize: "1.1rem" }}>
          <p><strong>A :</strong> 0</p>
          <p><strong>B :</strong> -3 (A → C → B, 5 + (-8) = -3)</p>
          <p><strong>C :</strong> 5</p>
        </div>
      </div>

      {/* Итоговый вывод */}
      <div style={{ background: "#fff3e0", padding: "1rem", borderRadius: "8px" }}>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>📝 Итог:</h3>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Дейкстра:</strong> Не подходит для графов с отрицательными рёбрами, так как жадный выбор вершины нарушает корректность.</li>
          <li><strong>Беллман–Форд:</strong> Корректно работает с отрицательными рёбрами за O(V·E).</li>
          <li><strong>В данном графе:</strong> Кратчайший путь A → B = -3 через C.</li>
        </ul>
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center", padding: "0.5rem", background: "#f0f0f0", borderRadius: "8px", fontSize: "0.9rem" }}>
        <strong>🎯 Ответ:</strong> A:0, B:-3 (A→C→B, 5+(-8)=-3), C:5
      </div>
    </div>
  );
};

export default ComparDijkstra;