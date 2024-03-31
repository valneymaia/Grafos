
/** Define VertexName como um alias para string  */
export type VertexName = string;

/** Define EdgeName como um alias para string  */
export type EdgeName = string;

/** Define Edge como um objeto com os campos nome e valor */
export type Edge = {
    name: EdgeName;
    value: number;
};

/** Define Adjacency como uma associação onde para cada Vertice vizinho há uma aresta.
 * ex:
 * 
 * [
 * 
 *      ["v2", {name: "e2", value: "15"},
 *      ["v3", {name: "e4", value: "6"},
 * 
 * ]
 * 
 * onde "v2" e "v3" são um vertice que é adjacente a um vertice vx pela aresta "e2" e "e4" respectivamente
*/ 
export type Adjacency = Map<VertexName, Edge>;

/** Define AdjacencyList como uma associação onde para cada Vertice há uma Adjacencia. 
 * ex:
 * 
 * [
 * 
 *      [v1, [ ["v2", {name: "e2", value: "15"}], ["v3", {name: "e1", value: "6"}] ],
 *      [v2, [ ["v1", {name: "e2", value: "15"}], ["v3", {name: "e3", value: "11"}] ],
 *      [v3, [ ["v1", {name: "e1", value: "6"}], ["v2", {name: "e3", value: "11"}] ]
 * 
 * ]
 * 
 * onde "v1", "v2" e "v3" são um vertice que possuem respectivamente as listas de adjacencia:
 * 
 * [ ["v2", {name: "e2", value: "15"}], ["v3", {name: "e1", value: "6"}],
 * 
 * [ ["v1", {name: "e2", value: "15"}], ["v3", {name: "e3", value: "11"}],
 * 
 * [ ["v1", {name: "e1", value: "6"}], ["v2", {name: "e3", value: "11"}]
 * 
*/
export type AdjacencyList = Map<VertexName, Adjacency>;

export type Path = Map<VertexName, {path: string[]; distance: number}>;
