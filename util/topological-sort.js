const { makeGraph, noCycles, predecessors } = require('./dag');


/**
 * @function
 * 
 */
function topologicalSort(items, pairs) {
    const g = makeGraph(pairs);
    const order = [];
    // Set of nodes with no incoming edge
    let S = new Set(items.filter(v => predecessors(g, v).size === 0));
    while (S.size > 0) {
        for (const n of S) {
            order.push(n);
            for (const m of (g[n] || [])) {
                g[n].delete(m);
                if (predecessors(g, m).size === 0) {
                    S.add(m);
                }
            }
        }
    }
    return order;
}


module.exports = {
    topologicalSort
}
