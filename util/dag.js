/**
 * @typedef Graph
 * @template V
 * @type {object}
 */


/**
 * @function
 * @template V
 * @param {Graph<V>} graph
 * @param {V} vertex
 * @return {Set<V>}
 */
function transitiveSuccessors(graph, v) {
    const toCheck = new Set(graph[v]);
    const checked = new Set();

    while (toCheck.size > 0) {
        for (const u of toCheck) {
            checked.add(u);

            for (const w of graph[u]) {
                if (!checked.has(w)) {
                    toCheck.add(w)
                }
            }
            
            toCheck.delete(u);
        }
    }

    return checked;
}


/**
 * @template V
 * @return {Graph<V>}
 */
function makeGraph(items) {
    const graph = {};

    for (const [u, v] of items) {
        graph[u] = v;
    }

    return graph;
}


/**
 * @template V
 * @param {Graph<V>} graph
 * @return {boolean}
 */
function noCycles(graph) {
    for (const v in graph) {
        if (transitiveSuccessors(graph, v).has(v)) {
            return false;
        }
    }
    return true;
}
