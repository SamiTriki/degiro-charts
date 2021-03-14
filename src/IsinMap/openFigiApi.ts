import { OpenFigiSecurity } from './types'
// Utils to Get Data from openfigi API
/**
 * Rate limits:
 * 25req/60s
 * 10jobs max/request
 * all *10 with api key
 */

type OpenFigiResponseJSON = Array<{
  data: Array<OpenFigiSecurity>
}>

type OpenFigiMappingRequestBody = {
  idType: string
  idValue: string
}

export function getFirstSecurityFromIsinList(
  isinArray: Array<string>
): Promise<OpenFigiSecurity[]> {
  const requestBody = isinArray.map(isin => ({
    idType: 'ID_ISIN',
    idValue: isin,
  }))

  return fetchOpenFigiMapping(requestBody).then(openFigiJSON => {
    return openFigiJSON.map(figiDataForIsin => figiDataForIsin[0])
  })
}

// Will return the first security returned by the openFigi api when doing an ISIN lookup
export function getFirstSecurityFromIsin(isin: string): Promise<OpenFigiSecurity> {
  const requestBody = [{ idType: 'ID_ISIN', idValue: isin }]

  return fetchOpenFigiMapping(requestBody).then(openFigiJSON => {
    return openFigiJSON[0][0]
  })
}

export function getAllSecuritiesFromIsin(isin: string): Promise<OpenFigiSecurity[]> {
  const requestBody = [{ idType: 'ID_ISIN', idValue: isin }]

  return fetchOpenFigiMapping(requestBody).then(openFigiJSON => {
    return openFigiJSON[0]
  })
}

function fetchOpenFigiMapping(requestBody: OpenFigiMappingRequestBody[]) {
  return window
    .fetch(`${process.env.REACT_APP_OPENFIGI_API_URL}/mapping`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    .then(async res => {
      if (!res.ok) {
        const { statusText, status, type } = res
        throw new Error(
          `An error occured while fetching openfigi data [${type}]${status}:${statusText}`
        )
      }

      const openFigiJSON: OpenFigiResponseJSON = await res.json()

      return openFigiJSON.map((figi: Record<string, OpenFigiSecurity[]>) => figi.data)
    })
}
