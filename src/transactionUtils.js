const REGEXES = {
  deposit:    new RegExp(/^Deposit|Deposit$/),
  withdrawal: new RegExp(/^Withdrawal|Withdrawal$/),
  interest:   new RegExp(/^Money.Market.fund|^Fund.Distribution$/),
  dividend:   new RegExp(/^Dividend$|^Capital.Return$/),
  fx:         new RegExp(/^FX.Credit|Debit$/),
  fee:        new RegExp(/Duty$|DEGIRO.*Fee|Reimbursement/),
  // Capturing shareCurrency as it can be different from transaction currency ex: GBP -> GBX
  buy:        new RegExp(/^Buy.(\d*\.?\d+).*C?@(\d*\.?\d+).([A-Z]{3})/), // [shareCount, sharePrice, shareCurrency]
  sell:       new RegExp(/^Sell.(\d*\.?\d+).*C?@(\d*\.?\d+).([A-Z]{3})/),// [shareCount, sharePrice, shareCurrency]
}

/**
 we want to decorate transactions with augmented information that can be parsed from its
 description and other properties like orderID in order to be able to present transactions in
 a better way whether through the transaction list or chart
 TODO: separate decoration and CSV extraction. Keep csv extraction for cleaning up property names and adding dates functions
 Keep decorateTransactions for adding new properties from description and linking transactions together
*/
function decorateTransactions(transactions = []) {
  const decorated = transactions.map(transaction => {
    const { description } = transaction;

    if (REGEXES.deposit.test(description)) {
      transaction.type = 'deposit'
      return transaction
    }
    if (REGEXES.withdrawal.test(description)) {
      transaction.type = 'withdrawal'
      return transaction
    }
    if (REGEXES.interest.test(description)) {
      transaction.type = 'interest'
      return transaction
    }
    if (REGEXES.dividend.test(description)) {
      transaction.type = 'dividend'
      return transaction
    }
    if (REGEXES.fx.test(description)) {
      transaction.type = 'fx'
      return transaction
    }
    if (REGEXES.fee.test(description)) {
      transaction.type = 'fee'
      return transaction
    }
    if (REGEXES.buy.test(description)) {
      const [, shareCount, sharePrice, shareCurrency] = REGEXES.buy.exec(description)
      transaction.type = 'buy'
      transaction.shareCount = shareCount
      transaction.sharePrice = sharePrice
      transaction.shareCurrency = shareCurrency
      return transaction
    }
    if (REGEXES.sell.test(description)) {
      const [, shareCount, sharePrice, shareCurrency] = REGEXES.sell.exec(description)
      transaction.type = 'sell'
      transaction.shareCount = shareCount
      transaction.sharePrice = sharePrice
      transaction.shareCurrency = shareCurrency
      return transaction
    }

    transaction.type = 'unknown'
    return transaction;
  })

  return decorated
}


 // Find interesting insights about transactions
 function getDashboardInfo(transactions = []) {

  return {
    totalTrades: 0, // count sell/buy
    totalReturns: 0, // P&L transactions.reduce((all, t) => all.val + t.val, 0)
    totalFees: 0, // total fees value
    totalDividends: 0, // total dividend value, sort by stock?
    totalWithdrawn: 0, // total withdrawal values
    totalDeposited: 0,  // total deposit values
    totalSharesOnMarket: 0, // totalbuys - totalsells
    topStocks: ['ISIN / Ticker', 'ISIN / Ticker', '...'],
    worstStocks: ['ISIN / Ticker', 'ISIN / Ticker', '...'],
    biggestWin: 'orderID' // sell order w/ max positive value
  }
 }

export { decorateTransactions }

// function getStockInfos(tickerorisin, transactions) {

//   return stocks // [{sympol: 'TSLA', productp&l: 10, trades: n, first bought, last_bought, first_sold, last_sold, 200_days_moving_avg, top price bought, top price sold, lowest price bought, lowest price sold}]
// }

/**
 * Transaction Data (These properties don't apply to every transaction types):
 * currency: "GBP" - The currency in which the transaction is settled, the 'value' entry is in that currency
 * value: 415 - Value of transaction in the currency specified
 * product: "SUPERFASTCARS MOTORS INC. - C" - Stock being bought or sold as a descriptive string
 * description: "Some description" - Describes the transaction with informations relative to the nature of the product being exchanged or the fee
 * orderId: "dummy-dummy-dummy-18" - What order is this transaction attached to. Fx credits, debits, transaction fees share the orderID of a stock purchase
 * fx: 1.21233 - Exchange rate multiplier. Appears for FX credits/Debit in a currency other than the account currency and is equal to home_currency / currency
 * isin: "US00000R000FAKE" - ISIN of the product being purchased. Cross exchange unique identifier, can be mapped to a symbol via the adequate api / mapping
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
 * BUY A STOCK: Buy {shareCount} {product_name} C@{sharePrice} {shareCurrency} ({isin})

 sell:
 * SELL A STOCK: Sell {shareCount} {product_name} C@{sharePrice} {shareCurrency} ({isin})
 */
