/**
 * Takes an array of promises to execute in a throttled manner, passes
 * the results and errors as callbacks
 * It doesn't wait for the previous to be done before firing the next
 *
 * It resolves when all the requests have been made,
 * but can still fire onNewError or onNewResult afterwards
 */
import { throttle } from './throttle'

const fakefetch = (str: any, delay = 1000): Promise<string> => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(str)
    }, delay)
  })
}

throttle(
  [
    () => fakefetch('https://randomuser.me/api/1', 5000),
    () => fakefetch('https://randomuser.me/api/2', 2000),
    () => fakefetch('https://randomuser.me/api/3', 1000),
    () => fakefetch('https://randomuser.me/api/4', 7000),
    () => fakefetch('https://randomuser.me/api/5', 1000),
    () => fakefetch('https://randomuser.me/api/6', 1000),
    () => fakefetch('https://randomuser.me/api/7', 3000),
    () => fakefetch('https://randomuser.me/api/8', 1000),
    () => fakefetch('https://randomuser.me/api/9', 1000),
  ],
  {
    delay: 1000,
    onProgress: progress => console.log('progress: ', progress * 100 + '% '),
    onNewResults: results => console.log('result', results),
    onDone: () => console.log('ALL DONE HOMIE'),
  }
)

describe('Throttle', () => {
  it('calls the first promise straight away', () => {})
  it("doesn't wait for previous promises to be fulfilled", () => {})
  it('shows correct progress no matter the promise execution', () => {})
  it('calls onError when something is wrong', () => {})
  it('calls onNewResults when new data is resolved', () => {})
  it('calls onDone when all promises are fullfiled', () => {})
  it('resolves when all promises have been called', () => {})
  it('rejects when not passed an array', () => {})
  it('rejects wrongly formatted promises', () => {})
  it('rejects when promises are passed instead of function returning promise with a message helping the developer', () => {})
  it.skip('[FUTURE]times out when a promise takes too long with an additional timeout argument', () => {})
})
