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

export async function getFirstSecurityFromIsinList(isinArray: Array<string>) {
  const requestBody = isinArray.map(isin => ({
    idType: 'ID_ISIN',
    idValue: isin,
  }))

  const securitiesList = await fetchOpenFigiMapping(requestBody)

  return securitiesList.map(openFigiSecuritiesForIsin => openFigiSecuritiesForIsin[0])
}

export async function getAllSecuritiesFromIsin(isin: string) {
  const requestBody = [{ idType: 'ID_ISIN', idValue: isin }]

  const securitiesList = await fetchOpenFigiMapping(requestBody)

  return securitiesList[0]
}

// Will return the first security returned by the openFigi api when doing an ISIN lookup
export async function getFirstSecurityFromIsin(isin: string) {
  const requestBody = [{ idType: 'ID_ISIN', idValue: isin }]

  const securitiesList = await fetchOpenFigiMapping(requestBody)

  return securitiesList[0][0]
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
