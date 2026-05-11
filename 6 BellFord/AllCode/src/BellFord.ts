import type { Edge, BellmanFordResult } from './types'

export function bellmanFord(
  vertices: string[],
  edges: Edge[],
  start: string
): BellmanFordResult {
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();

  vertices.forEach((v) => {
    distances.set(v, Infinity);
    predecessors.set(v, null);
  });
  distances.set(start, 0);

  for (let i = 0; i < vertices.length - 1; i++) {
    for (const edge of edges) {
      const distU = distances.get(edge.from) ?? Infinity;
      const distV = distances.get(edge.to) ?? Infinity;
      
      if (distU !== Infinity && distU + edge.weight < distV) {
        distances.set(edge.to, distU + edge.weight);
        predecessors.set(edge.to, edge.from);
      }
    }
  }

  let hasNegativeCycle = false;
  const negativeNodes = new Set<string>();
  
  for (const edge of edges) {
    const distU = distances.get(edge.from) ?? Infinity;
    const distV = distances.get(edge.to) ?? Infinity;
    
    if (distU !== Infinity && distU + edge.weight < distV) {
      hasNegativeCycle = true;
      negativeNodes.add(edge.from);
      negativeNodes.add(edge.to);
    }
  }

  return {
    distances,
    predecessors,
    hasNegativeCycle,
    negativeCycleNodes: negativeNodes.size > 0 ? Array.from(negativeNodes) : undefined,
  };
}

export function reconstructPath(
  predecessors: Map<string, string | null>,
  target: string
): string[] {
  const path: string[] = [];
  let current: string | null = target;

  while (current !== null) {
    path.unshift(current);
    current = predecessors.get(current) ?? null;
  }

  return path;
}