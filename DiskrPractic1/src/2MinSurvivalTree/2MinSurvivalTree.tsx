import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../algos.css';

type Edge = {
  from: string;
  to: string;
  weight: number;
};

// Данные из таблицы 7.3
const edges: Edge[] = [
  { from: 'A', to: 'B', weight: 13 },
  { from: 'A', to: 'C', weight: 3 },
  { from: 'A', to: 'D', weight: 9 },
  { from: 'A', to: 'E', weight: 9 },
  { from: 'B', to: 'C', weight: 11 },
  { from: 'B', to: 'D', weight: 11 },
  { from: 'B', to: 'E', weight: 13 },
  { from: 'C', to: 'D', weight: 9 },
  { from: 'C', to: 'E', weight: 7 },
  { from: 'D', to: 'E', weight: 2 },
];

const findMinimumSpanningTree = (edges: Edge[]) => {
  const nodes = [...new Set(edges.flatMap(edge => [edge.from, edge.to]))];
  const visited = new Set<string>([nodes[0]]);
  const mst: Edge[] = [];

  while (visited.size < nodes.length) {
    let bestEdge: Edge | null = null;

    for (const edge of edges) {
      const fromVisited = visited.has(edge.from);
      const toVisited = visited.has(edge.to);

      if (fromVisited !== toVisited) {
        if (!bestEdge || edge.weight < bestEdge.weight) {
          bestEdge = edge;
        }
      }
    }

    if (bestEdge) {
      mst.push(bestEdge);
      visited.add(bestEdge.from);
      visited.add(bestEdge.to);
    } else {
      break; // граф несвязный
    }
  }

  return mst;
};

const Task2: React.FC = () => {
  const [mst, setMST] = useState<Edge[]>([]);

  const handleCalculateMST = () => {
    const minimumSpanningTree = findMinimumSpanningTree(edges);
    setMST(minimumSpanningTree);
  };

  const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);

  return (
    <div className="app-container">
      <h1>Упражнение 2</h1>
      <p>Пример 7.9. Найдите минимальное остовное дерево.</p>
      <button onClick={handleCalculateMST}>Вычислить</button>

      {mst.length > 0 && (
        <>
          <h3>Минимальное остовное дерево:</h3>
          <ul>
            {mst.map((edge, index) => (
              <li key={index}>
                {edge.from} — {edge.to} : {edge.weight}
              </li>
            ))}
          </ul>
          <p><strong>Общий вес: {totalWeight}</strong></p>
        </>
      )}

      <Link to="/1sTask">
        <button>Предыдущий алгоритм</button>
      </Link>
      <Link to="/3rTask">
        <button>Следующий алгоритм</button>
      </Link>
    </div>
  );
};

export default Task2;