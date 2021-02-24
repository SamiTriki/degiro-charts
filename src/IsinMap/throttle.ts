/**
 * Takes an array of functions returning promises to execute in a throttled manner, passes
 * the results and errors as callbacks in onNewResults and onNewErrors respectively
 * It doesn't wait for the previous promise to be fullfilled before firing the next,
 * only wait for the delay
 *
 * It resolves when all the requests have been made,
 * but can still fire onNewError or onNewResult afterwards
 * It calls onDone when all the requests have completed wether successfully or failed
 *
 */
export async function throttle<PromiseReturnType>(
  promisesToExecute: Array<() => Promise<PromiseReturnType>>,
  {
    delay = 1000,
    onNewError = () => {},
    onNewResults = () => {},
    onProgress = () => {},
    onDone = () => {},
  }: {
    delay?: number
    onNewError?: (err: Error) => void
    onNewResults?: (result: PromiseReturnType) => void
    onProgress?: (progress: number) => void
    onDone?: () => void
  }
): Promise<string> {
  const total = promisesToExecute.length
  let completed = 0

  const handlePromiseToExecute = (index: number): void => {
    promisesToExecute[index]()
      .then(res => onNewResults(res))
      .catch((err: any) => onNewError(err))
      .finally(() => {
        completed++
        onProgress(completed / total)
        if (completed === total) {
          onDone()
        }
      })
  }

  for (let i = 0; i < total; i++) {
    handlePromiseToExecute(i)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  return 'all_done'
}
