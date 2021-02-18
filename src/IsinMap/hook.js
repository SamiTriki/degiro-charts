import { getSecuritiesFromIsins } from './openFigiApi.ts'
import { useEffect, useState, useCallback } from 'react'

const getIsinMapFromTransactions = transactions => {
  return transactions.reduce((isinMap, t) => {
    if (t.isin) {
      return {
        ...isinMap,
        [t.isin]: null,
      }
    }
    return isinMap
  }, {})
}

const getLocalIsinMap = () => {
  let localIsinMap
  try {
    localIsinMap = JSON.parse(window.localStorage.getItem('degirocharts.isinmap'))
    if (typeof localIsinMap !== 'object') {
      return {}
    }

    return localIsinMap
  } catch (e) {
    return {}
  }
}

const saveLocalIsinMap = isinMap => {
  window.localStorage.setItem('degirocharts.isinmap', JSON.stringify(isinMap))
}

const deleteLocalIsinMap = () => {
  window.localStorage.removeItem('degirocharts.isinmap')
}

const getMissingSecuritiesIsins = isinMap => {
  return Object.entries(isinMap).reduce((missingSecuritiesIsins, current) => {
    let [isin, attachedSecurity] = current
    if (attachedSecurity === null) {
      return [...missingSecuritiesIsins, isin]
    }
    return missingSecuritiesIsins
  }, [])
}

const fetchMissingIsins = async missingIsinArray => {
  let figiresults
  try {
    figiresults = await getSecuritiesFromIsins(missingIsinArray)
  } catch (e) {
    console.error('error while fetching missing securities', e)
    return {}
  }

  // Go through the missing isins and find the associated security in the results, then generate an isin map from it
  const missingIsinsMap = missingIsinArray.reduce((all, isin, index) => {
    const security = figiresults[index] ? { ...figiresults[index], isin } : null

    return {
      ...all,
      [isin]: security || { message: 'could not find associated security', isin },
    }
  }, {})

  return missingIsinsMap
}

const UseIsinMap = transactions => {
  const [isinMap, setIsinMap] = useState(() => {
    // Always override with localIsinMap
    return { ...getIsinMapFromTransactions(transactions), ...getLocalIsinMap() }
  })

  const [newlyAddedIsin, setNewlyAddedIsin] = useState(null)
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
    cb => {
      if (newlyAddedIsin !== null) {
        cb(newlyAddedIsin)
      }
    },
    [newlyAddedIsin]
  )

  return { isinMap, status, onNewIsinAdded }
}

export { UseIsinMap }
