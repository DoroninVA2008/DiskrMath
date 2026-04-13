import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../algos.css'

type Vertex = string;

interface Edge {
  from: Vertex;
  to: Vertex;
  weight: number;
}

type AdjacencyMatrix = Map<Vertex, Map<Vertex, number>>;

interface AlgorithmState {
  currentPath: Vertex[];
  visited: Set<Vertex>;
  currentVertex: Vertex | null;
  totalWeight: number;
  stepResults: string[];
  isFinished: boolean;
}

interface GraphVisualizerProps {
  vertices: Vertex[];
  edges: Edge[];
  highlightPath?: Vertex[];
  highlightEdge?: [Vertex, Vertex] | null;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ vertices, edges, highlightPath, highlightEdge }) => {
  return (
    <div className="graph-visualizer">
      <h3>Граф:</h3>
      <div className="graph-nodes">
        <strong>Вершины:</strong> {vertices.join(', ')}
      </div>
      <div className="graph-edges">
        <strong>Ребра:</strong>
        <ul>
          {edges.map((edge, index) => {
            const isHighlightedEdge = highlightEdge && 
                                      ((highlightEdge[0] === edge.from && highlightEdge[1] === edge.to) ||
                                       (highlightEdge[0] === edge.to && highlightEdge[1] === edge.from));
            const edgeClass = isHighlightedEdge ? 'highlight-edge' : '';
            return (
              <li key={index} className={edgeClass}>
                {edge.from}-{edge.to} (Вес: {edge.weight})
              </li>
            );
          })}
        </ul>
      </div>
       {highlightPath && highlightPath.length > 0 && (
        <div className="graph-path">
          <strong>Текущий путь: </strong>
          {highlightPath.map((v, i) => (
            <span key={i} className={i === highlightPath.length - 1 ? 'highlight-path-vertex' : ''}>
              {v}{i < highlightPath.length - 1 ? ' -> ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface NearestNeighborSolverProps {
  initialGraphEdges: Edge[];
  startVertex: Vertex;
}

export const NearestNeighborSolver: React.FC<NearestNeighborSolverProps> = ({ initialGraphEdges, startVertex }) => {
  const [algorithmState, setAlgorithmState] = useState<AlgorithmState>(() => ({
    currentPath: [],
    visited: new Set<Vertex>(),
    currentVertex: null,
    totalWeight: 0,
    stepResults: [],
    isFinished: false,
  }));

  const [, setCurrentStep] = useState(0);
  const [highlightedEdge, setHighlightedEdge] = useState<[Vertex, Vertex] | null>(null);

  const allVertices = useMemo<Vertex[]>(() => {
    const vertices = new Set<Vertex>();
    initialGraphEdges.forEach(edge => {
      vertices.add(edge.from);
      vertices.add(edge.to);
    });
    return Array.from(vertices).sort();
  }, [initialGraphEdges]);

  const adjacencyMatrix = useMemo<AdjacencyMatrix>(() => {
    const matrix: AdjacencyMatrix = new Map();
    allVertices.forEach(v => matrix.set(v, new Map()));

    initialGraphEdges.forEach(edge => {
      matrix.get(edge.from)?.set(edge.to, edge.weight);
      matrix.get(edge.to)?.set(edge.from, edge.weight);
    });
    return matrix;
  }, [allVertices, initialGraphEdges]);

  const performNextStep = useCallback(() => {
    setAlgorithmState(prevState => {
      if (prevState.isFinished) return prevState;

      let newPath = [...prevState.currentPath];
      let newVisited = new Set(prevState.visited);
      let newCurrentVertex = prevState.currentVertex;
      let newTotalWeight = prevState.totalWeight;
      const newStepResults = [...prevState.stepResults];
      let finished = false;
      let nextHighlightedEdge: [Vertex, Vertex] | null = null;

      if (!newCurrentVertex) {
        newCurrentVertex = startVertex;
        newPath.push(newCurrentVertex);
        newVisited.add(newCurrentVertex);
        newStepResults.push(`Шаг 1: Начинаем с вершины ${newCurrentVertex}.`);
        setHighlightedEdge(null);
        return {
          ...prevState,
          currentPath: newPath,
          visited: newVisited,
          currentVertex: newCurrentVertex,
          stepResults: newStepResults,
        };
      }

      const unvisitedCount = allVertices.filter(v => !newVisited.has(v)).length;
      if (unvisitedCount === 0 && !finished) {
        const lastVertex = newCurrentVertex;
        const weightToStart = adjacencyMatrix.get(lastVertex)?.get(startVertex);
        if (weightToStart === undefined) {
             newStepResults.push(`Ошибка: Невозможно вернуться из ${lastVertex} в стартовую ${startVertex}.`);
             finished = true;
        } else {
            newPath.push(startVertex);newTotalWeight += weightToStart;
            nextHighlightedEdge = [lastVertex, startVertex];
            newStepResults.push(`Шаг ${newStepResults.length + 1}: Все вершины посещены. Возвращаемся в стартовую ${startVertex} из ${lastVertex} (вес ${weightToStart}).`);
            finished = true;
        }
      } else if (unvisitedCount > 0) { // Ищем ближайшую непосещенную вершину
        let minWeight = Infinity;
        let nextVertex: Vertex | null = null;

        const neighbors = adjacencyMatrix.get(newCurrentVertex);
        if (neighbors) {
          allVertices.forEach(v => {
            if (!newVisited.has(v)) {
              const weight = neighbors.get(v);
              if (weight !== undefined && weight < minWeight) {
                minWeight = weight;
                nextVertex = v;
              }
            }
          });
        }

        if (nextVertex !== null && minWeight !== Infinity) {
          const prevVertex = newCurrentVertex;
          newCurrentVertex = nextVertex;
          newPath.push(newCurrentVertex);
          newVisited.add(newCurrentVertex);
          newTotalWeight += minWeight;
          nextHighlightedEdge = [prevVertex, newCurrentVertex];
          newStepResults.push(`Шаг ${newStepResults.length + 1}: Из ${prevVertex} ближайшая непосещенная вершина ${newCurrentVertex} (вес ${minWeight}).`);
        } else {
          newStepResults.push(`Ошибка: Невозможно найти следующую вершину из ${newCurrentVertex}.`);
          finished = true;
        }
      }

      setHighlightedEdge(nextHighlightedEdge);

      return {
        currentPath: newPath,
        visited: newVisited,
        currentVertex: newCurrentVertex,
        totalWeight: newTotalWeight,
        stepResults: newStepResults,
        isFinished: finished,
      };
    });
    setCurrentStep(prev => prev + 1);
  }, [allVertices, adjacencyMatrix, startVertex]);

  const resetAlgorithm = useCallback(() => {
    setAlgorithmState({
      currentPath: [],
      visited: new Set<Vertex>(),
      currentVertex: null,
      totalWeight: 0,
      stepResults: [],
      isFinished: false,
    });
    setCurrentStep(0);
    setHighlightedEdge(null);
  }, []);

  return (
    <div className="solver-container">
      <h2>Алгоритм Ближайшего Соседа (Nearest Neighbor)</h2>
      <GraphVisualizer 
        vertices={allVertices} 
        edges={initialGraphEdges} 
        highlightPath={algorithmState.currentPath}
        highlightEdge={highlightedEdge}
      />

      <div className="controls">
        <button onClick={performNextStep} disabled={algorithmState.isFinished}>
          Следующий шаг
        </button>
        <button onClick={resetAlgorithm}>
          Начать заново
        </button>
      </div>

      <div className="results">
        <h3>Ход выполнения:</h3>
        {algorithmState.stepResults.map((result, index) => (
          <p key={index}>{result}</p>
        ))}
        {algorithmState.isFinished && (
          <>
            <h4>Результат:</h4>
            <p className="final-path">
              Итоговый путь: {algorithmState.currentPath.join(' -> ')}
            </p>
            <p className="final-weight">
              Общий вес пути (длина цикла): {algorithmState.totalWeight}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export const Task1: React.FC = () => {
    const graphEdges: Edge[] = useMemo(() => [
        { from: 'A', to: 'B', weight: 5 },
        { from: 'A', to: 'C', weight: 6 },
        { from: 'A', to: 'D', weight: 8 },
        { from: 'B', to: 'C', weight: 7 },
        { from: 'B', to: 'D', weight: 10 },
        { from: 'C', to: 'D', weight: 3 },
    ], []);

    const startNode = 'D';

    return (
        <div className="app-container">
            <h1>Упражнение 1</h1>
            <p>Пример 7.6. Примените алгоритм ближайшего соседа к графу, изображенному на рис. 7.11. За исходную вершину возьмите вершину D.</p>
            <NearestNeighborSolver 
                initialGraphEdges={graphEdges} 
                startVertex={startNode} 
            />
            <Link to="/2nTask">
              <button>
                Следующий алгоритм
              </button>
            </Link>
        </div>
    );
};

export default Task1;