/**
 * @description Represents a security with all the attributes we'd expect, it's retrieved online in the openFigi api
 * get decorated with isin and used for showing stock tickers on the app
 */
export interface OpenFigiSecurity {
  name: string
  ticker: string
  exchCode: string
  securityType: string
  securityType2: string
  securityDescription: string
  marketSector: string
  isin?: string
}

export type OpenFigiResponseJSON = Array<{
  data: Array<OpenFigiSecurity>
}>

export type OpenFigiMappingRequestBody = {
  idType: string
  idValue: string
}

export function looksLikeOpenFigiSecurity(object: any): object is OpenFigiSecurity {
  let expectedProps = [
    'name',
    'ticker',
    'exchCode',
    'securityType',
    'securityType2',
    'securityDescription',
    'marketSector',
    'isin',
  ]

  return expectedProps.reduce(
    (isObjectOpenFigiSecurity: boolean, expectedProp: string) => {
      if (!isObjectOpenFigiSecurity) {
        // return immediately if one of the props isn't found
        return false
      }

      return object.hasOwnProperty(expectedProp)
    },
    true
  )
}

type missingIsinError = {
  message: string
  isin: string
}
type isin = string

export type IsinMap = Record<isin, OpenFigiSecurity | missingIsinError | null>
