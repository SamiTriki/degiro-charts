/**
 * Chunks array into bite-sized array of easier digestion
 * It returns chunks no matter the size of the array, keep that in mind
 * @param arr Array to chink
 * @param limit Maximum elements the array should contain
 */
export function chunk<ElementType>(arr: ElementType[], limit = 5): ElementType[][] {
  if (arr.length < limit) {
    return [arr] // keep return type consistent, easier to deal with when using the fn, maybe
  }

  const chunks = []

  for (let i = 0; i < arr.length; i = i + limit) {
    let chunk = arr.slice(i, i + limit)
    chunks.push(chunk)
  }

  return chunks
}
