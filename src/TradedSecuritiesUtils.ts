/**
 * @description Represents a security that has been traded extracted from the transactions list, it's local to the csv
 * it's used to search securities online so that their information can be completed, they have no other use besides searching for more info
 */
export interface TradedSecurity {
  isin: string
  name: string
}
