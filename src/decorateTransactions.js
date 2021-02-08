function decorateTransactions(transactions = []) {
  // we want to decorate transactions with augmented information that can be parsed from its
  // description and other properties like orderID in order to be able to present transactions in
  // a better way whether through the transaction list or chart
  // TODO: separate decoration and CSV extraction. Keep csv extraction for cleaning up property names and adding dates functions
  // Keep decorateTransactions for adding new properties from description and linking transactions together
  // return decoratedTransactions
}

/**
 * Transaction Data (not every transaction type has it):
 * currency: "GBP" - The currency in which the transaction is settled, the 'value' entry is in that currency
 * value: 415 - Value of transaction in the currency specified
 * product: "SUPERFASTCARS MOTORS INC. - C" - Stock being bought or sold as a descriptive string
 * description: "Some description" - Describes the transaction with informations relative to the nature of the product being exchanged
 * orderId: "dummy-dummy-dummy-18" - What order is this transaction attached to. Fx credits, debits, transaction fees share the orderID of a stock purchase
 * fx: 1.21233 - Exchange rate multiplier. Seems to appear for FX credits and is equal to home_currency / currency
 * isin: "US00000R000FAKE" - ISIN of the product being purchased. Cross exchange unique identifier, can be mapped to a symbol via the adequate api
 * date: Date - The date the transaction is executed
 * dateString: "yyyy-mm-dd" - String for representing the day date a transaction happened. used to sort transactions into different periods
 * timestamp: 1559925240000 - Timestamp of date, used for easy sorting
 *
 * Transaction types and their descriptions and what can be exracted into types and metadata:
 * deposit:
 * Desposit: I add cash into my account
 *
 * withdrawal:
 * Withdrawal: I withdraw cash out of my account
 *
 * interest:
 * Fund Distribution: I get interest on my cash balance
 * Dividend: Dividend payment
 * Capital return: (Not sure) Might be divident reinvestment or rectifying too much divident distributed

 * fx:
 * FX Credit: My currency account gets credited
 * FX Debit: My currency account gets debited
 *
 * fee:
 * DEGIRO Transaction Fee: Price associated with a transaction
 * Stamp duty: tax on investment - London stock exchange
 * DEGIRO Exchange Connection Fee (EXCHANGE - EXG): Transaction fee for connecting to an exchange
 * Reimbursement for the new customer promotion: Offer credit

 buy:
 * BUY A STOCK: Buy {n} {product_name} C@{price} {currency} ({isin})

 sell:
 * SELL A STOCK: Sell {n} {product_name} C@{price} {Currency} ({isin})
 */

 // Find interesting insights about transactions
 function getDashboardInfo(transactions = []) {

  return {
    totalTrades: 0,
    totalReturns: 0,
    totalFees: 0,
    totalDividends: 0,
    totalWithdrawn: 0,
    totalDesposited: 0,
    sharesOnTheMarket: 0,
    mostProfitableStock: 'ISIN / Ticker',
    leastProfitableStock: 'ISIN / Ticker',
    biggestWin: 'orderID'
  }
 }
