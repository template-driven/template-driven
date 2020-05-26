/******************************************************
 * Created by nanyuantingfeng on 2019-05-22 15:52.
 *****************************************************/
function sortByOrders<T>(items: T[], orders: T[]) {
  const oo = []

  let i = -1
  while (++i < orders.length) {
    if ((items || []).indexOf(orders[i]) > -1) {
      oo.push(orders[i])
    }
  }

  return oo
}

function visit(
  vertex: string,
  visited: Record<string, boolean>,
  recStack: Record<string, boolean>,
  result: string[],
  depsmap: Record<string, string[]>,
  orders: string[]
) {
  if (!visited[vertex]) {
    visited[vertex] = true
    recStack[vertex] = true
    const neighbors = sortByOrders(depsmap[vertex], orders)
    let i = -1
    while (++i < neighbors.length) {
      const current = neighbors[i]
      if (!visited[current]) {
        const ooo = [current]
        if (visit(current, visited, recStack, ooo, depsmap, orders)) {
          result.push(...ooo)
          return true
        }
      } else if (recStack[current]) {
        result.push(current)
        return true
      }
    }
  }

  recStack[vertex] = false
  return false
}

export function detectCycle(deps: Record<string, string[]>) {
  const nodes = Object.keys(deps)
  const visited: Record<string, boolean> = {}
  const recStack: Record<string, boolean> = {}
  let result: string[] = []
  let i = -1

  while (++i < nodes.length) {
    const node = nodes[i]
    result = [node]
    if (visit(node, visited, recStack, result, deps, nodes)) {
      return result
    }
  }

  return false
}

export default detectCycle
