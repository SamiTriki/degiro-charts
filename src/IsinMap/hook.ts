import { useEffect, useReducer } from 'react'
import { getFirstSecurityFromIsinList } from './openFigiApi'
import { Transaction } from './../transactionUtils'
import { IsinMap, OpenFigiSecurity } from './types'
import { chunk } from './chunk'
import { throttle } from './throttle'

const DELAY_BETWEEN_REQUESTS_MS = 2400
const MAX_JOBS_PER_REQUEST = 10

/**
 * TODO:
 * - Add node middleware to repo cache isinMap, forward requests to openfigi
 * - Handle openfigi key and limits
 * - Add fetch wrapper if I repeat requests for other apis than openFigi
 */

const getIsinMapFromTransactions = (transactions: Transaction[]) => {
  return transactions.reduce((isinMap, transaction): IsinMap => {
    const { isin } = transaction

    if (isin) {
      return {
        ...isinMap,
        [isin]: null,
      }
    }

    return isinMap
  }, {} as IsinMap)
}

const getIsinMapFromMissingIsins = async (missingIsinsArray: string[]) => {
  try {
    const securitiesList = await getFirstSecurityFromIsinList(missingIsinsArray)
    const missingIsinsMap: IsinMap = {}

    missingIsinsArray.forEach((isin, idx) => {
      if (!securitiesList[idx]) {
        return
      }

      missingIsinsMap[isin] = securitiesList[idx]
    })

    return missingIsinsMap
  } catch (e) {
    console.error(
      `Error while getting securities for following isins ${missingIsinsArray}`,
      e
    )
    return {}
  }
}

const getLocalStorageIsinMap = () => {
  let localIsinMap: IsinMap
  try {
    localIsinMap = JSON.parse(window.localStorage.getItem('degirocharts.isinmap') || '')
    if (typeof localIsinMap !== 'object') {
      return {}
    }

    return localIsinMap
  } catch (e) {
    return {}
  }
}

const saveLocalIsinMap = (isinMap: IsinMap) => {
  window.localStorage.setItem('degirocharts.isinmap', JSON.stringify(isinMap))
}

const getMissingIsins = (isinMap: IsinMap): string[] => {
  return Object.keys(isinMap).filter(isin => isinMap[isin] === null)
}

type UseIsinMapState = {
  status: string
  isinMap: IsinMap
}

function isinMapReducer(prevState: UseIsinMapState, action: any) {
  switch (action.type) {
    case 'SUCCESS':
      return { ...prevState, status: 'success' }
    case 'PENDING':
      return { ...prevState, status: 'pending' }
    case 'ERROR':
      return { ...prevState, status: 'error', error: action.error }
    case 'NEW_ISIN_DATA':
      return {
        ...prevState,
        isinMap: { ...prevState.isinMap, ...action.payload },
      }
    default:
      return prevState
  }
}

// actions: new isins, isins complete, isin fetching errors,
const UseIsinMap = (transactions: Transaction[]) => {
  const [{ isinMap, status }, dispatch] = useReducer(isinMapReducer, {
    status: 'idle',
    isinMap: { ...getIsinMapFromTransactions(transactions), ...getLocalStorageIsinMap() },
  })

  /**
   * Fetch securities from the api when new transactions are added
   */
  useEffect(() => {
    /**
     * Add Isins generated from transactions in case transactions change
     * and new ones are added
     * TODO: Test this
     */
    const missingIsinsArray = getMissingIsins({
      ...getIsinMapFromTransactions(transactions),
      ...isinMap,
    })

    if (!missingIsinsArray.length && !transactions.length) {
      // Bailing out, nothing to do
      return
    }

    if (!missingIsinsArray.length) {
      dispatch({ type: 'SUCCESS' })
      console.info('Isins map up to date, all symbols should show correctly')
      return
    }

    dispatch({ type: 'PENDING' })
    const isinsToRetrieve = chunk(missingIsinsArray, MAX_JOBS_PER_REQUEST)
    const chunkedPromisesArray = isinsToRetrieve.map((isinsArray: Array<string>) => () =>
      getIsinMapFromMissingIsins(isinsArray)
    )
    /**
     * Since we're getting rate limited, chunk the retrieval of missing isins into mapping jobs
     * Each mapping job is defined below, will fetch missing isins and return an isin map with the
     * results from the openFigi Api
     */
    throttle(chunkedPromisesArray, {
      delay: DELAY_BETWEEN_REQUESTS_MS,
      onNewResults: missingIsinMap => {
        dispatch({ type: 'NEW_ISIN_DATA', payload: missingIsinMap })
      },
      onDone: () => {
        dispatch({ type: 'SUCCESS' })
      },
    })
  }, [isinMap, transactions])

  useEffect(() => {
    saveLocalIsinMap(isinMap)
  }, [isinMap])

  return { isinMap, status }
}

export { UseIsinMap }
