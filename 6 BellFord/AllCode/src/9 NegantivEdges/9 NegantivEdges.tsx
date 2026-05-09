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
};

const NegantivEdges: React.FC = () => {
  const edges: Edge[] = [
    { from: "S", to: "A", weight: 3 },
    { from: "S", to: "B", weight: 4 },
    { from: "A", to: "B", weight: -2 },
    { from: "B", to: "C", weight: 1 },
    { from: "A", to: "C", weight: 5 },
  ];

  const vertices = ["S", "A", "B", "C"];
  const start = "S";

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

    for (const edge of edges) {
      if (dist[edge.from] + edge.weight < dist[edge.to]) {
        console.warn("Обнаружен отрицательный цикл!");
        break;
      }
    }

    const results: ShortestPathResult[] = [];
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
        path: path,
      });
    }
    return results;
  };

  const [results] = useState<ShortestPathResult[]>(() => findShortestPaths());

  const formatPath = (path: string[]): string => {
    if (path.length === 1 && path[0] === start) return start;
    if (path.length === 1) return `Нет пути из ${start} в ${path[0]}`;
    return path.join(" → ");
  };

  const getPathCalculation = (path: string[]): { expr: string; sum: number } => {
    if (path.length < 2) return { expr: "", sum: 0 };
    const weights: number[] = [];
    const expressions: string[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(
        (e) => e.from === path[i] && e.to === path[i + 1]
      );
      if (edge) {
        weights.push(edge.weight);
        expressions.push(`${edge.weight}`);
      }
    }
    return {
      expr: expressions.join(" + "),
      sum: weights.reduce((a, b) => a + b, 0),
    };
  };

  const getRelaxationSteps = () => {
    const steps: { iteration: number; edge: string; calculation: string; result: string }[] = [];
    const dist: Record<string, number> = { S: 0, A: Infinity, B: Infinity, C: Infinity };

    steps.push({
      iteration: 0,
      edge: "Инициализация",
      calculation: "",
      result: `S:0, A:∞, B:∞, C:∞`,
    });

    const edgesOrder = [...edges];

    // S → A
    if (dist.S + 3 < dist.A) {
      dist.A = 3;
      steps.push({ iteration: 1, edge: "S → A (3)", calculation: "0 + 3 = 3", result: `S:0, A:3, B:∞, C:∞` });
    }
    // S → B
    if (dist.S + 4 < dist.B) {
      dist.B = 4;
      steps.push({ iteration: 1, edge: "S → B (4)", calculation: "0 + 4 = 4", result: `S:0, A:3, B:4, C:∞` });
    }
    // A → B
    if (dist.A + (-2) < dist.B) {
      dist.B = 1;
      steps.push({ iteration: 1, edge: "A → B (-2)", calculation: "3 + (-2) = 1", result: `S:0, A:3, B:1, C:∞` });
    }
    // B → C
    if (dist.B + 1 < dist.C) {
      dist.C = 2;
      steps.push({ iteration: 1, edge: "B → C (1)", calculation: "1 + 1 = 2", result: `S:0, A:3, B:1, C:2` });
    }
    // A → C
    if (dist.A + 5 < dist.C) {
      steps.push({ iteration: 1, edge: "A → C (5)", calculation: "3 + 5 = 8 (не обновляется)", result: `S:0, A:3, B:1, C:2` });
    }

    return steps;
  };

  const steps = getRelaxationSteps();

  return (
    <div className="page-card">
      <div className="task-header">
        <h2>Кратчайшие пути от S (два отрицательных ребра)</h2>
        <p>Алгоритм Беллмана–Форда. Ребро A → B (−2) улучшает путь до B и C.</p>
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
          Стартовая вершина: <strong>S</strong> | Отрицательные рёбра: <strong style={{ color: "#c62828" }}>A → B (-2)</strong>
        </div>
      </div>

      <div className="code-block">
        <h3>Псевдокод алгоритма Беллмана–Форда</h3>
        <pre>
{`function BellmanFord(edges, start, n):
    dist = [∞, ∞, ..., ∞]  # размер n
    dist[start] = 0

    # Релаксация (V-1 раз)
    for i in range(n-1):
        for (u, v, w) in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    # Проверка на отрицательные циклы
    for (u, v, w) in edges:
        if dist[u] + w < dist[v]:
            return "Обнаружен отрицательный цикл!"

    return dist`}
        </pre>
      </div>

      <details className="details-toggle" open>
        <summary>Пошаговая работа алгоритма (релаксация)</summary>
        <div className="details-body">
          <table className="bf-table">
            <thead>
              <tr>
                <th>Итерация</th>
                <th>Ребро</th>
                <th>Вычисление</th>
                <th>Текущие расстояния</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, idx) => (
                <tr key={idx} className={step.edge.includes("-2") ? "row-red" : ""}>
                  <td>{step.iteration}</td>
                  <td style={{ fontWeight: step.edge.includes("-2") ? "bold" : "normal" }}>
                    {step.edge}
                  </td>
                  <td>{step.calculation}</td>
                  <td style={{ fontSize: "0.85rem" }}>{step.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="info-block info-block--green">
        <h3>РЕЗУЛЬТАТЫ (кратчайшие пути от S):</h3>

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
            {results.map((res) => {
              const calc = getPathCalculation(res.path);
              return (
                <tr key={res.vertex}>
                  <td>
                    <strong>{res.vertex}</strong>
                  </td>
                  <td>
                    {res.distance === Infinity ? "∞" : res.distance}
                  </td>
                  <td>
                    {formatPath(res.path)}
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "#555" }}>
                    {calc.expr && `${calc.expr} = ${calc.sum}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="info-block info-block--orange">
        <h3>Почему отрицательное ребро улучшает путь?</h3>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Прямой путь S → B:</strong> длина = 4</li>
          <li><strong>Путь через отрицательное ребро S → A → B:</strong> 3 + (-2) = <strong style={{ color: "#2e7d32" }}>1</strong> (короче на 3!)</li>
          <li><strong>Путь до C через отрицательное ребро:</strong> S → A → B → C = 3 + (-2) + 1 = <strong>2</strong></li>
          <li>Прямой путь A → C (5) гораздо длиннее, поэтому не используется</li>
        </ul>
      </div>

      <div className="info-block info-block--gray">
        <h3>Сложность алгоритма:</h3>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Временная сложность:</strong> O(V·E) = O(4·5) = O(20) операций</li>
          <li><strong>Пространственная сложность:</strong> O(V) для хранения расстояний</li>
          <li><strong>Количество итераций релаксации:</strong> V-1 = 3</li>
          <li><strong>Отрицательные циклы:</strong> не обнаружены</li>
        </ul>
      </div>

      <div className="answer-bar">
        <strong>Ответ (по условию):</strong>
        <div style={{ marginTop: "0.5rem" }}>
          <div><strong>S :</strong> 0</div>
          <div><strong>A :</strong> 3</div>
          <div><strong>B :</strong> 1 (S → A → B, 3 + (-2) = 1)</div>
          <div><strong>C :</strong> 2 (S → A → B → C, 3 - 2 + 1 = 2)</div>
        </div>
      </div>
    </div>
  );
};

export default NegantivEdges;
