import { getSecuritiesFromIsins } from './openFigiApi.ts'
import { useEffect, useState, useCallback } from 'react'

const generateIsinMapFromTransactions = transactions => {
  return transactions.reduce((isinMap, t) => {
    if (!t.isin) {
      return isinMap
    }

    return {
      ...isinMap,
      [t.isin]: null,
    }
  }, {})
}

const getLocalIsinMap = () => {
  let localIsinMap
  try {
    localIsinMap = JSON.parse(
      window.localStorage.getItem('degirocharts.isinmap')
    )
    return localIsinMap
  } catch (e) {
    return null
  }
}

const saveLocalIsinMap = isinMap => {
  window.localStorage.setItem('degirocharts.isinmap', JSON.stringify(isinMap))
}

const deleteLocalIsinMap = () => {
  window.localStorage.removeItem('degirocharts.isinmap')
}

const getMissingIsinsArray = isinMap => {
  return Object.entries(isinMap).reduce((missing, current) => {
    let [isin, attachedSecurity] = current
    if (attachedSecurity === null) {
      return [...missing, isin]
    }
    return missing
  }, [])
}

const fetchMissingIsins = async missingIsinArray => {
  let figiresults
  try {
    figiresults = await getSecuritiesFromIsins(missingIsinArray)
  } catch (e) {
    return {}
  }

  let missingIsinsMap = missingIsinArray.reduce((all, isin, index) => {
    let security = figiresults[index] ? { ...figiresults[index], isin } : null

    return {
      ...all,
      [isin]: security || { message: 'could not find isin', isin },
    }
  }, {})

  return missingIsinsMap
}

const UseIsinMap = transactions => {
  const [isinMap, setIsinMap] = useState(() => {
    const isinMapFromTransactions = generateIsinMapFromTransactions(
      transactions
    )
    const localIsinMap = getLocalIsinMap()

    if (localIsinMap === null) {
      return isinMapFromTransactions
    }

    return { ...isinMapFromTransactions, ...localIsinMap }
  })
  const [newlyAddedIsin, setNewlyAddedIsin] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    async function getMissinIsinData() {
      let missingIsinsArray = getMissingIsinsArray({
        ...generateIsinMapFromTransactions(transactions),
        ...isinMap, // TODO: test that when we already have data in the isin map, it's not refetched
      })

      if (!missingIsinsArray.length) {
        setStatus('success')
        console.log('no isins to update')
        return
      }

      try {
        setStatus('pending')
        let missingIsinsMap = await fetchMissingIsins(missingIsinsArray)
        setIsinMap(currentIsinMap => ({
          ...currentIsinMap,
          ...missingIsinsMap,
        }))
        setNewlyAddedIsin({ ...missingIsinsMap })
        saveLocalIsinMap({ ...isinMap, ...missingIsinsMap })
        setStatus('success')
      } catch (e) {
        setStatus('error')
        console.log('error while fetching isins')
        console.error(e)
      }
    }
    getMissinIsinData()
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
