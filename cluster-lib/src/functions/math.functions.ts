export function combinations(n: number, k: number) {
  var results = [];
  var recursive = (start: number, result: number[]) => {  
    if (result.length === k) {
      results.push(result.map(value => Number(value)));
    }    
    for (var i = start; i < n + 1; i++) {
      result.push(i);
      recursive(i + 1, result);
      result.pop();
    }
  }
  recursive(1, []);
  return results;
}