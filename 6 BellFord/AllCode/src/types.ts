export interface Edge {
  from: string;
  to: string;
  weight: number;
}

export interface BellmanFordResult {
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  hasNegativeCycle: boolean;
  negativeCycleNodes?: string[];
}

export interface PathResult {
  path: string[];
  distance: number;
}