import { useState } from "react"
import { Transaction } from "./transactionUtils";
const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/'

interface TradedSecuritiesProps {
  transactions: Transaction[]
}

/**
 * @description Represents a security that has been traded extracted from the transactions list, it's local to the csv
 * it's used to search securities online so that their information can be completed, they have no other use besides searching for more info
 */
interface TradedSecurity {
  isin: string,
  name: string,
}

/**
 * @description Represents a security with all the attributes we'd expect, it's retrieved online in the openFigi api
 * get decorated with isin and used for showing stock tickers on the app
 */
interface OpenFigiSecurity {
  name: string,
  ticker: string,
  exchCode: string,
  securityType: string,
  securityType2: string,
  securityDescription: string,
  marketSector: string,
  isin?: string // todo: decorate openfigi symbols with isin for easier mapping
}

function searchOpenFigi(isin : string) : Promise<OpenFigiSecurity[]> {
  // TODO: Use own middleware as proxy for openfigi and keep isin/symbol mapping there
  return window.fetch(CORS_PROXY_URL+'https://api.openfigi.com/v2/mapping', {
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify([{"idType":"ID_ISIN","idValue": isin}])
  })
  .then(res => {
    if (!res.ok) {
      const {statusText, status, type } = res;
      throw new Error(`An error occured while fetching openfigi data [${type}]${status}:${statusText}`)
    }

    return res.json()
  })
  .then(openFigiJSON => {
    // flatten figi map response
    return openFigiJSON.map((figi : Record<string,Transaction[]>) => figi.data)
  })

}
/**
 *
 * We want to find ticker symbols associated with an isin
 * we initially want a function that analyses the ISIN in our transactions and
 * associate it with "known symbols"
 *
 * Phase 1
 *
 * We are going to toy around with a search to find ticker symbols results given an isin number and set data types and expecations ✅
 *
 * Phase 2
 *
 * We are going to automate ticker retrieval by querying openfigi data and mapping our isin / ticker with the first result found
 * We also want to cache a ISIN / Stock ticker map in localstorage so that we can use it instead of querying openfigi unnecessarily for known ISIN
 * we will do this when the app loads: check all transactions, if an isin is not in our isin map then fetch it and add it to the map.
 * Handle errors, do not refetch if an isin is not found, instead add an error that can be manually corrected later on
 *
 * Phase 3
 *
 * Offer our user a way to change the ticker associated with the ISIN in case the default one doesn't work or an error occured while fetching the data
 * by offering all other openfigi results as options to chose from, update our map with the right ticker and save
 *
 * Phase 4
 *
 * Add a mini loader on top right of the page indicating symbols refetching
 * Create new symbol related components.
 * Add the possibility to have a peek at the current stock price.
 *
 * Phase 5 refactoring ?
 * Use react error boundary
 * Use react-query
 * Find the right abstraction for search results, errors ect
 */
export default function TradedSecurities({transactions} : TradedSecuritiesProps) {
  const [searchResults, setSearchResults] = useState(null as any)
  const [fetchError, setFetchError] = useState(null as any)
  const [status, setStatus] = useState('idle')

  // Find traded products from transactions
  const securities = transactions.reduce((products , t) => {
    const { isin, product } = t
    if (!isin || !product) {
      return products;
    }

    return {
      ...products,
      [product]: { isin, name: product }
    }
  }, {} as Record<TradedSecurity["name"], TradedSecurity>)

  function onSelectSecurity(product : TradedSecurity) : void {
    setStatus('pending')

    searchOpenFigi(product.isin)
      .then(res => {
        setStatus('resolved')
        if (res?.length) {
          return setSearchResults(res[0])
        }
      })
      .catch(e => {
        setFetchError(e);
        setStatus('error')
      })
  }

  let results = searchResults?.length ?
     <pre>{JSON.stringify(searchResults[0],null, '  ')}</pre> :
     <pre>No results found on openFigi for that ISIN, what a bad luck (we might offer broader search in the future might might)</pre>

  return (
    <div className="container">
      <p>Currently traded securities:</p>
      {
        Object.values(securities).map((security) => {
          return (
            <button key={security.isin} onClick={() => onSelectSecurity(security)}>{security.name}</button>
          )
        })
      }
      {
      status === 'idle' ? <div>Click one of the products to find detailed ticker information</div> :
      status === 'resolved' ? <pre>{results}</pre> :
      status === 'error' ? <div style={{color: 'red'}}>Something went wrong {fetchError?.message}</div> :
      status === 'pending' ? <div>...</div> : null}
    </div>
  )
}
