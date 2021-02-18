import { useEffect, useState, useCallback } from 'react'
import { getSecuritiesFromIsins } from './openFigiApi'
import { Transaction } from './../transactionUtils'
import { IsinMap, OpenFigiSecurity, looksLikeOpenFigiSecurity } from './types'

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

const getLocalIsinMap = () => {
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
    figiresults = await getSecuritiesFromIsins(missingIsinArray)
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

const UseIsinMap = (transactions: Transaction[]) => {
  const [isinMap, setIsinMap] = useState(() => {
    // Always override with localIsinMap
    return { ...getIsinMapFromTransactions(transactions), ...getLocalIsinMap() }
  })

  const [newlyAddedIsin, setNewlyAddedIsin] = useState({} as IsinMap)
  const [status, setStatus] = useState('idle')

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

      if (!missingIsinsArray.length) {
        setStatus('success')
        console.info('Isins map up to date, all symbols should show correctly')
        return
      }

      try {
        setStatus('pending')
        const missingIsinsMap = await fetchMissingIsins(missingIsinsArray)
        setIsinMap(currentIsinMap => ({
          ...currentIsinMap,
          ...missingIsinsMap,
        }))
        setNewlyAddedIsin({ ...missingIsinsMap })
        saveLocalIsinMap({ ...isinMap, ...missingIsinsMap })
        setStatus('success')
      } catch (e) {
        setStatus('error')
        console.error(e)
      }
    }
    getMissingSecuritiesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions])

  const onNewIsinAdded = useCallback(
    (cb: (arg0: Record<string, OpenFigiSecurity>) => unknown) => {
      if (Object.entries(newlyAddedIsin).length) {
        cb(FilterMissingAndErrorIsins(newlyAddedIsin))
      }
    },
    [newlyAddedIsin]
  )

  return { isinMap, status, onNewIsinAdded }
}

export { UseIsinMap }
