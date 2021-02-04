
// { Date: '20/10/2020', Time: '10:50'} => Date Object
const stringToDate = (transactionFromCSV) => {
  let [day, month, year] = transactionFromCSV.Date.split('-')
  let [hour, second] = transactionFromCSV.Time?.split(':')
  // Month is 0 indexed
  return new Date(year, month - 1, day, hour, second);
}

// Date Object => '2020-01-29'
const dateToString = (date) => {
  let [day, month, year] = date.toLocaleDateString("en-GB", { // you can skip the first argument
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split('/')

  return `${year}-${month}-${day}`
}

function formatTransactions(CSVResults) {
  return CSVResults
    .filter(t => t)
    .filter(t => t.Date && t.Time)
    .map(transaction => {
      const { Value, Product, Description, Currency} = transaction
      let date = stringToDate(transaction)
      let dateString = dateToString(date)

      return {
        date,
        dateString,
        value: Value ? parseFloat(Value) : 0,
        description: `${Product} ${Description}`,
        currency: Currency
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}


// [{date, value, name, currency }, {...}] to =>
// {"2020-01-01": { change: 100, total: 200, transactions: 3}, "2020-01-20":{...}}
const formatDatesForChart = (transactions, period = 'day') => transactions.reduce((dates, current) => {
  const [year, month, day] = current.dateString.split('-')
  let dateString = period === 'day' ? `${year}-${month}-${day}` : period === 'month' ? `${year}-${month}` : year
  let previousPeriodKey = Object.keys(dates)[Object.keys(dates).length-1];
  let prevTotal = dates[previousPeriodKey]?.total || 0

  if (dates[dateString]) {
      dates[dateString].change += current.value
      dates[dateString].total += current.value
      dates[dateString].transactions++
  } else {
      dates[dateString] = {
        change: current.value,
        total: current.value + prevTotal,
        transactions: current.value ? 1 : 0,
        prevPeriod: previousPeriodKey
      };
  }

  return dates
}, {})

export { formatTransactions, formatDatesForChart }
