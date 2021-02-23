// Utils to Get Data from openfigi API
import { OpenFigiSecurity } from './types'
/**
 * Rate limits:
 * 25req/60s
 * 10jobs max/request
 * all *10 with api key
 */

export function getSecuritiesFromIsins(
  isinArray: Array<string>
): Promise<OpenFigiSecurity[]> {
  let requestBody = isinArray.map(isin => ({
    idType: 'ID_ISIN',
    idValue: isin,
  }))

  return window
    .fetch(process.env.REACT_APP_OPENFIGI_API_URL + '/mapping', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    .then(res => {
      if (!res.ok) {
        const { statusText, status, type } = res
        throw new Error(
          `An error occured while fetching openfigi data [${type}]${status}:${statusText}`
        )
      }

      return res.json()
    })
    .then(openFigiJSON => {
      // flatten figi map response
      return openFigiJSON.map(
        (figi: Record<string, OpenFigiSecurity[]>) => figi.data[0]
      )
    })
}

export function searchOpenFigi(isin: string): Promise<OpenFigiSecurity[]> {
  // TODO: Use own middleware as proxy for openfigi and keep isin/symbol mapping there
  return window
    .fetch(process.env.REACT_APP_OPENFIGI_API_URL + '/mapping', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ idType: 'ID_ISIN', idValue: isin }]),
    })
    .then(res => {
      if (!res.ok) {
        const { statusText, status, type } = res
        throw new Error(
          `An error occured while fetching openfigi data [${type}]${status}:${statusText}`
        )
      }

      return res.json()
    })
    .then(openFigiJSON => {
      // flatten figi map response
      return openFigiJSON.map(
        (figi: Record<string, OpenFigiSecurity[]>) => figi.data[0]
      )
    })
}
