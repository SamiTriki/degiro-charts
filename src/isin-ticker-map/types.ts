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
