import { decorateTransactions, Transaction } from './transactionUtils'

// { Date: '20/10/2020', Time: '10:50'} => Date Object
const csvTransactionToDate = (csvTransaction: any): Date => {
  let [day, month, year] = csvTransaction.Date.split('-')
  let [hour, second] = csvTransaction.Time?.split(':')
  // Month is 0 indexed
  return new Date(year, month - 1, day, hour, second)
}

// Date Object => '2020-01-29'
const csvDateToString = (date: Date): string => {
  let [day, month, year] = date
    .toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('/')

  return `${year}-${month}-${day}`
}

function getTransactionsFromCSV(CSVResults: any[]): Transaction[] {
  let transactions: Transaction[] = CSVResults.filter(t => t)
    .filter(t => t.Date && t.Time)
    .map(transaction => {
      const { Value, Product, Description, Currency, ISIN, FX } = transaction
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
        orderId: transaction['Order Id'],
        type: 'unknown',
      } as Transaction
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return decorateTransactions(transactions)
}

export { getTransactionsFromCSV }
