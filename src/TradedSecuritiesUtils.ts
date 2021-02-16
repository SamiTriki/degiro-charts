
/**
 * @description Represents a security that has been traded extracted from the transactions list, it's local to the csv
 * it's used to search securities online so that their information can be completed, they have no other use besides searching for more info
 */
export interface TradedSecurity {
  isin: string,
  name: string,
}

/**
 * @description Represents a security with all the attributes we'd expect, it's retrieved online in the openFigi api
 * get decorated with isin and used for showing stock tickers on the app
 */
export interface OpenFigiSecurity {
  name: string,
  ticker: string,
  exchCode: string,
  securityType: string,
  securityType2: string,
  securityDescription: string,
  marketSector: string,
  isin?: string // todo: decorate openfigi symbols with isin for easier mapping
}
