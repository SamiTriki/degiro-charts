import { useState } from 'react'
import { Transaction } from '../transactionUtils'
import { getFirstSecurityFromIsin } from '../IsinMap/openFigiApi'
import { OpenFigiSecurity, IsinMap } from '../IsinMap/types'

/**
 * @description Represents a security that has been traded extracted from the transactions list, it's local to the csv
 * it's used to search securities online so that their information can be completed, they have no other use besides searching for more info
 */
interface TradedSecurity {
  isin: string
  name: string
}

/**
 *
 * We want to find ticker symbols associated with an isin
 * we initially want a function that analyses the ISIN in our transactions and
 * associate it with "known symbols"
 *
 * Phase 1 ✅
 *
 * We are going to toy around with a search to find ticker symbols results given an isin number and set data types and expecations
 *
 * Phase 2 ✅
 *
 * We are going to automate ticker retrieval by querying openfigi data and mapping our isin / ticker with the first result found
 * We also want to cache a ISIN / Stock ticker map in localstorage so that we can use it instead of querying openfigi unnecessarily for known ISIN
 * we will do this when the app loads: check all transactions, if an isin is not in our isin map then fetch it and add it to the map.
 *
 * Phase 3
 *
 * Handle errors, do not refetch if an isin is not found, instead add an error that can be manually corrected later on
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
 * Refactor UseIsinMap
 * Use react-query ?? no necessary given the fact that there's little server state
 * Find the right abstraction for search results, errors ect
 */
interface TradedSecuritiesProps {
  transactions: Transaction[]
  isinMap: IsinMap
}

export default function TradedSecurities({
  transactions,
  isinMap,
}: TradedSecuritiesProps) {
  const [searchResults, setSearchResults] = useState(null as OpenFigiSecurity | null)
  const [fetchError, setFetchError] = useState(null as any)
  const [status, setStatus] = useState('idle')

  // Find traded products from transactions
  const securities = transactions.reduce((securities, t) => {
    const { isin, product } = t
    if (!isin || !product) {
      return securities
    }

    return {
      ...securities,
      [product]: { isin, name: product },
    }
  }, {} as Record<TradedSecurity['name'], TradedSecurity>)

  function onSelectSecurity(product: TradedSecurity): void {
    setStatus('pending')

    getFirstSecurityFromIsin(product.isin)
      .then(res => {
        setStatus('resolved')
        if (res) {
          return setSearchResults(res)
        }
      })
      .catch(e => {
        setFetchError(e)
        setStatus('error')
      })
  }

  let results = searchResults ? (
    <pre>{JSON.stringify(searchResults, null, '  ')}</pre>
  ) : (
    <pre>
      No results found on openFigi for that ISIN, what a bad luck (we might offer broader
      search in the future might might)
    </pre>
  )

  return (
    <div className="container">
      <p>Currently traded securities:</p>
      {Object.values(securities).map(security => {
        return (
          <button key={security.isin} onClick={() => onSelectSecurity(security)}>
            {security.name}
            <pre>
              {isinMap ? JSON.stringify(isinMap[security.isin], null, ' ') : null}
            </pre>
          </button>
        )
      })}
      {status === 'idle' ? (
        <div>Click one of the products to find detailed ticker information</div>
      ) : status === 'resolved' ? (
        <pre>{results}</pre>
      ) : status === 'error' ? (
        <div style={{ color: 'red' }}>Something went wrong {fetchError?.message}</div>
      ) : status === 'pending' ? (
        <div>...</div>
      ) : null}
    </div>
  )
}
