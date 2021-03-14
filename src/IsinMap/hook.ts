import { useEffect, useCallback, useReducer, useRef } from 'react'
import { getFirstSecurityFromIsinList } from './openFigiApi'
import { Transaction } from './../transactionUtils'
import { IsinMap, OpenFigiSecurity, looksLikeOpenFigiSecurity } from './types'
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

function getChunkedFetchIsinMap(isinArray: Array<string>) {
  const chunked = chunk(isinArray, MAX_JOBS_PER_REQUEST)
  return chunked.map((isinsArray: Array<string>) => () => fetchMissingIsins(isinsArray))
}

const getIsinMapFromTransactions = (transactions: Transaction[]) => {
  return transactions.reduce((isinMap, t): IsinMap => {
    if (t.isin) {
      return {
        ...isinMap,
        [t.isin]: null,
      }
    }
    return isinMap
  }, {} as IsinMap)
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

const deleteLocalIsinMap = () => {
  window.localStorage.removeItem('degirocharts.isinmap')
}

const getMissingSecuritiesIsins = (isinMap: IsinMap): string[] => {
  return Object.entries(isinMap).reduce((missingSecuritiesIsins: string[], current) => {
    let [isin, attachedSecurity] = current
    if (attachedSecurity === null) {
      return [...missingSecuritiesIsins, isin]
    }
    return missingSecuritiesIsins
  }, [])
}

const fetchMissingIsins = async (missingIsinArray: string[]) => {
  let figiresults: OpenFigiSecurity[]
  try {
    figiresults = await getFirstSecurityFromIsinList(missingIsinArray)
  } catch (e) {
    console.error('error while fetching missing securities', e)
    return {}
  }

  // Go through the missing isins and find the associated security in the results, then generate an isin map from it
  const missingIsinsMap = missingIsinArray.reduce(
    (isinMap, isin, index: number): IsinMap => {
      const security = figiresults[index] ? { ...figiresults[index], isin } : null
      return {
        ...isinMap,
        [isin]: security || { message: 'could not find associated security', isin },
      }
    },
    {} as IsinMap
  )

  return missingIsinsMap
}

// Is this overkill? Probably, toying with typeguards
// This function cleans out null props or errors from the newly added isin to provide only cleanly added
// securities to the callback
// needs more thinking, we might want to display errors at some point, but this is good to know I can do this
const FilterMissingAndErrorIsins = (
  isinMap: IsinMap
): Record<string, OpenFigiSecurity> => {
  return Object.entries(isinMap).reduce((filteredIsinMap, [isin, security]) => {
    if (looksLikeOpenFigiSecurity(security)) {
      return {
        ...filteredIsinMap,
        [isin]: security,
      }
    } else {
      return filteredIsinMap
    }
  }, {} as Record<string, OpenFigiSecurity>)
}

type UseIsinMapState = {
  status: string
  isinMap: IsinMap
  newlyAddedIsin: IsinMap
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
        newlyAddedIsin: action.payload,
        isinMap: { ...prevState.isinMap, ...action.payload },
      }
    default:
      return prevState
  }
}

// actions: new isins, isins complete, isin fetching errors,
const UseIsinMap = (transactions: Transaction[]) => {
  const [{ isinMap, status, newlyAddedIsin }, dispatch] = useReducer(isinMapReducer, {
    status: 'idle',
    isinMap: { ...getIsinMapFromTransactions(transactions), ...getLocalStorageIsinMap() },
    newlyAddedIsin: {},
  })

  const newlyAddedIsinRef = useRef(newlyAddedIsin)

  useEffect(() => {
    async function getMissingSecuritiesData() {
      /**
       * Add Isins generated from transactions in case transactions change
       * and new ones are added
       * TODO: Test this
       */
      const missingIsinsArray = getMissingSecuritiesIsins({
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

      try {
        dispatch({ type: 'PENDING' })

        const chunkedPromises = getChunkedFetchIsinMap(missingIsinsArray)

        await throttle(chunkedPromises, {
          delay: DELAY_BETWEEN_REQUESTS_MS,
          onNewResults: missingIsinMap => {
            dispatch({ type: 'NEW_ISIN_DATA', payload: missingIsinMap })
            /**
             * When any action is dispatched, the state changes and the value of newlyAddedIsin is not the same reference
             * which re triggers the onNewIsinAdded callback.
             * Keep the newly added isin as a ref to compare them before executing the callback
             * */
            newlyAddedIsinRef.current = missingIsinMap
          },
          onNewError: error => {
            // new state for partial errors
          },
          onDone: () => {
            dispatch({ type: 'SUCCESS' })
          },
        })
      } catch (e) {
        dispatch({ type: 'ERROR', error: e })
        console.error(e)
      }
    }
    getMissingSecuritiesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length])

  useEffect(() => {
    saveLocalIsinMap(isinMap)
  }, [isinMap])

  const onNewIsinAdded = useCallback(
    (cb: (newlyAddedIsin: Record<string, OpenFigiSecurity>) => void) => {
      if (newlyAddedIsinRef.current === newlyAddedIsin) {
        return
      }

      if (Object.entries(newlyAddedIsin).length) {
        const filteredIsinMap = FilterMissingAndErrorIsins(newlyAddedIsin)
        cb(filteredIsinMap)
      }
    },
    [newlyAddedIsin]
  )

  return { isinMap, status, onNewIsinAdded }
}

export { UseIsinMap }
