export function getRandomInteger(min: string, max: string) {
  const lowerBound = Math.ceil(+min)
  const upperBound = Math.floor(+max)

  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound
}
