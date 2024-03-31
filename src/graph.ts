import {
  VertexName,
  EdgeName,
  AdjacencyList,
  Path,
  Adjacency,
  Edge,
} from "./types";

export default class Graph {
  readonly adjacencyList: AdjacencyList;

  constructor() {
    this.adjacencyList = new Map();
  }

  get verticesNames(): VertexName[] {
    let vertices: VertexName[] = [];

    for (let vertex of this.adjacencyList.keys()) {
      vertices = [...vertices, vertex];
    }

    return vertices;
  }

  get edgesNames(): EdgeName[] {
    let edges: EdgeName[] = [];

    for (let adjacency of this.adjacencyList.values()) {
      for (let edge of adjacency.values()) {
        edges = [...edges, edge.name];
      }
    }

    return edges;
  }

  public addVertex(vertex: VertexName): boolean {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, new Map());
      return true;
    }

    return false;
  }

  public addEdge(
    origin: VertexName,
    destiny: VertexName,
    name: EdgeName,
    value?: number
  ): boolean {
    this.addVertex(origin);
    this.addVertex(destiny);

    const adjacency = this.adjacencyList.get(origin)!;

    if (!adjacency.has(name)) {
      adjacency.set(destiny, { name: name, value: value ? value : 1 });
      return true;
    }

    return false;
  }

  public removeVertex(vertex: VertexName): boolean {
    for (let [originVertex, adjacency] of this.adjacencyList.entries()) {
      for (let destinyVertex of adjacency.keys()) {
        if (destinyVertex === vertex) {
          adjacency.delete(destinyVertex);
        }
      }
    }

    return this.adjacencyList.delete(vertex);
  }

  public removeEdge(origin: VertexName, destiny: VertexName): boolean {
    return this.adjacencyList.get(origin)!.delete(destiny);
  }

  public dijkstra(startVertex: VertexName): Path {
    const distances: Path = new Map();
    const visited: Set<VertexName> = new Set();

    for (const vertex of this.verticesNames) {
      distances.set(vertex, { path: [], distance: Infinity });
    }

    distances.set(startVertex, { path: [startVertex], distance: 0 });

    while (visited.size < this.verticesNames.length) {
      const currentVertex = this.getMinDistanceVertex(distances, visited);
      visited.add(currentVertex);

      for (const [neighbor, edge] of this.adjacencyList.get(currentVertex)!) {
        const distanceToNeighbor =
          distances.get(currentVertex)!.distance + edge.value;

        if (distanceToNeighbor < distances.get(neighbor)!.distance) {
          distances.set(neighbor, {
            path: [...distances.get(currentVertex)!.path, neighbor],
            distance: distanceToNeighbor,
          });
        }
      }
    }

    return distances;
  }

  private getMinDistanceVertex(
    distances: Path,
    visited: Set<VertexName>
  ): VertexName {
    let minDistance = Infinity;
    let minVertex: VertexName = "";

    for (const [vertex, { distance }] of distances) {
      if (!visited.has(vertex) && distance < minDistance) {
        minDistance = distance;
        minVertex = vertex;
      }
    }

    return minVertex;
  }

  public getEdgeBetween(
    origin: VertexName,
    destiny: VertexName
  ): Edge | undefined {
    const adjacency: Adjacency = this.adjacencyList.get(origin)!;
    return adjacency.get(destiny);
  }

  public getNeighborhood(vertex: VertexName): string[] {
    const neighbors: string[] = [];
    const adjacency: Adjacency = this.adjacencyList.get(vertex)!;

    if (adjacency.size > 0) {
      for (let to of adjacency.keys()) {
        neighbors.push(to);
      }
    }
    return neighbors;
  }

  public toString() {
    let graph = [];
    let graphToString;

    for (let vertex of this.adjacencyList.keys()) {
      let item: string = "";
      let neighbors: string[] = this.getNeighborhood(vertex);

      if (neighbors.length > 0) {
        item = neighbors.reduce(
          (previous, current) => `${previous}, ${current}`
        );
      }

      graph.push(`{ ${vertex}: [ ${item} ] }`);
    }

    graphToString = graph.reduce((previous, current) => `${previous},\n  ${current}`);

    return `Graph(V: ${this.verticesNames.length}, E: ${this.edgesNames.length}) [\n  ${graphToString}\n]`;
  }
}
