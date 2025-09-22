export function hasUniqueFour(arr: unknown[]) {
  let count = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 4) {
      count++
      if (count > 1) return false
    }
  }
  return count === 1
}
