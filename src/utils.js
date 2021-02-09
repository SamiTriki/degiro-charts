import { decorateTransactions } from "./transactionUtils";

// { Date: '20/10/2020', Time: '10:50'} => Date Object
const csvTransactionToDate = (csvTransaction) => {
  let [day, month, year] = csvTransaction.Date.split('-')
  let [hour, second] = csvTransaction.Time?.split(':')
  // Month is 0 indexed
  return new Date(year, month - 1, day, hour, second);
}

// Date Object => '2020-01-29'
const csvDateToString = (date) => {
  let [day, month, year] = date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split('/')

  return `${year}-${month}-${day}`
}

function transactionsFromCSV(CSVResults) {
  let transactions = CSVResults
    .filter(t => t)
    .filter(t => t.Date && t.Time)
    .map(transaction => {
      const { Value, Product, Description, Currency, ISIN, FX} = transaction
      let date = csvTransactionToDate(transaction)
      let dateString = csvDateToString(date)
      let timestamp = date.getTime()

      return {
        date,
        dateString,
        timestamp,
        value: Value ? parseFloat(Value) : 0,
        product: Product,
        description: Description,
        currency: Currency,
        isin: ISIN,
        fx: FX,
        orderId: transaction['Order Id']
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

    return decorateTransactions(transactions)
}


// [{date, value, name, currency }, {...}] to =>
// {"2020-01-01": { value: 100, total: 200, transactions: 3}, "2020-01-20":{...}}
const transactionsPerPeriod = (transactions, period = 'day') => transactions.reduce((dates, current) => {
  const [year, month, day] = current.dateString.split('-')
  let periodDateString = period === 'day' ? `${year}-${month}-${day}` : period === 'month' ? `${year}-${month}` : year
  let previousPeriodKey = Object.keys(dates)[Object.keys(dates).length-1];
  let prevTotal = dates[previousPeriodKey]?.total || 0

  if (dates[periodDateString]) {
      dates[periodDateString].value += current.value
      dates[periodDateString].total += current.value
      dates[periodDateString].transactions++
  } else {
      dates[periodDateString] = {
        date: current.date,
        dateString: periodDateString,
        timestamp: current.timestamp,
        value: current.value,
        total: current.value + prevTotal,
        transactions: current.value ? 1 : 0,
        prevPeriod: previousPeriodKey,
      };
  }

  return dates
}, {})

export { transactionsFromCSV, transactionsPerPeriod }
