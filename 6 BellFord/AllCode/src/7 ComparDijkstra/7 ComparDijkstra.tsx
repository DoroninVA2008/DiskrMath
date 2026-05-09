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
    <div className="page-card">
      <div className="task-header">
        <h2>Сравнение алгоритмов: Дейкстра vs Беллман–Форд</h2>
        <p>Граф с отрицательным ребром C → B (−8). Дейкстра не гарантирует корректность.</p>
      </div>

      <div className="info-block info-block--blue">
        <h3>Граф с отрицательным ребром:</h3>
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
          Стартовая вершина: <strong>A</strong> | Отрицательное ребро: <strong style={{ color: "#c62828" }}>C → B (-8)</strong>
        </div>
      </div>

      <div className="info-block info-block--red">
        <h3>Почему Дейкстра не подходит?</h3>
        <p style={{ margin: 0 }}>
          Алгоритм Дейкстры основан на <strong>жадном принципе</strong> — он выбирает вершину с минимальным расстоянием
          и <strong>больше её не пересматривает</strong>. При наличии <strong>отрицательных весов</strong>
          более короткий путь может быть найден <strong>после</strong> того, как вершина уже была "зафиксирована".
        </p>
      </div>

      <div className="info-block info-block--gray">
        <h3 style={{ textAlign: "center" }}>Сравнение результатов</h3>

        <table className="bf-table">
          <thead>
            <tr>
              <th rowSpan={2}>Вершина</th>
              <th colSpan={2}>Алгоритм Дейкстры (ненадёжно)</th>
              <th colSpan={2}>Алгоритм Беллмана–Форда (верно)</th>
            </tr>
            <tr>
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
                  <td><strong>{res.vertex}</strong></td>
                  <td className={isWrong ? "row-red" : "row-blue"}>
                    {res.dijkstraDistance === Infinity ? "∞" : res.dijkstraDistance}
                    {isWrong && <span style={{ fontSize: "0.8rem", display: "block", color: "#c62828" }}>НЕВЕРНО</span>}
                  </td>
                  <td className="row-blue">{formatPath(res.dijkstraPath)}</td>
                  <td className="row-green">
                    {res.bellmanDistance === Infinity ? "∞" : res.bellmanDistance}
                  </td>
                  <td className="row-green">{formatPath(res.bellmanPath)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="details-toggle">
        <summary>Пошаговое сравнение работы алгоритмов</summary>
        <div className="details-body">
          <div className="grid-2">
            <div className="info-block info-block--indigo" style={{ marginBottom: 0 }}>
              <h4>Алгоритм Дейкстры (ненадёжно)</h4>
              <ol className="step-list">
                <li>dist[A]=0, dist[B]=∞, dist[C]=∞</li>
                <li>Выбираем A (мин. расстояние 0)</li>
                <li>Релаксация из A: dist[B]=10, dist[C]=5</li>
                <li>Фиксируем A (больше не пересматриваем)</li>
                <li>Выбираем C (мин. расстояние 5)</li>
                <li>Релаксация из C: 5 + (-8) = -3 → dist[B]=-3</li>
                <li><strong>ПРОБЛЕМА:</strong> если бы было ребро из фиксированной вершины с отрицательным весом, инвариант нарушился бы. Дейкстра <strong>не гарантирует</strong> корректность при отрицательных весах!</li>
              </ol>
              <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                В некоторых реализациях может "повезти", но алгоритм формально неприменим.
              </p>
            </div>

            <div className="info-block info-block--green" style={{ marginBottom: 0 }}>
              <h4>Алгоритм Беллмана–Форда (верно)</h4>
              <ol className="step-list">
                <li>dist[A]=0, dist[B]=∞, dist[C]=∞</li>
                <li><strong>Итерация 1:</strong></li>
                <li>A→B(10): dist[B]=10</li>
                <li>A→C(5): dist[C]=5</li>
                <li>C→B(-8): 5+(-8)=-3 → dist[B]=-3</li>
                <li><strong>Итерация 2:</strong> (проверка, нет улучшений)</li>
                <li><strong>Результат:</strong> B = -3, путь A→C→B</li>
              </ol>
              <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                Беллман–Форд выполняет <strong>|V|-1 = 2 итерации</strong>, что позволяет "протащить" улучшение через отрицательное ребро.
              </p>
            </div>
          </div>
        </div>
      </details>

      <div className="info-block info-block--green">
        <h3>Результат алгоритма Беллмана–Форда:</h3>
        <div>
          <p><strong>A :</strong> 0</p>
          <p><strong>B :</strong> -3 (A → C → B, 5 + (-8) = -3)</p>
          <p><strong>C :</strong> 5</p>
        </div>
      </div>

      <div className="info-block info-block--orange">
        <h3>Итог:</h3>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Дейкстра:</strong> Не подходит для графов с отрицательными рёбрами, так как жадный выбор вершины нарушает корректность.</li>
          <li><strong>Беллман–Форд:</strong> Корректно работает с отрицательными рёбрами за O(V·E).</li>
          <li><strong>В данном графе:</strong> Кратчайший путь A → B = -3 через C.</li>
        </ul>
      </div>

      <div className="answer-bar">
        <strong>Ответ:</strong> A:0, B:-3 (A→C→B, 5+(-8)=-3), C:5
      </div>
    </div>
  );
};

export default ComparDijkstra;
