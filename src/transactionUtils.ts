const REGEXES = {
  deposit:    new RegExp(/^Deposit$/i),
  withdrawal: new RegExp(/^Withdrawal$/i),
  interest:   new RegExp(/^Money.Market.fund|^Fund.Distribution$/i),
  dividend:   new RegExp(/^Dividend$|^Capital.Return$/i),
  fx:         new RegExp(/^FX.Credit|Debit$/i),
  fee:        new RegExp(/Stamp Duty$|DEGIRO.*Fee|Reimbursement/i),
  // Capturing shareCurrency as it can be different from transaction currency ex: GBP -> GBX
  buy:        new RegExp(/^Buy.(\d*\.?\d+).*@(\d*\.?\d+).([A-Z]{3}\b)/i), // [shareCount, sharePrice, shareCurrency]
  sell:       new RegExp(/^Sell.(\d*\.?\d+).*@(\d*\.?\d+).([A-Z]{3}\b)/i),// [shareCount, sharePrice, shareCurrency]
}

export interface Transaction {
  readonly currency?: string,
  readonly value?: number,
  readonly product?: string,
  readonly description?: string,
  readonly orderId?: string,
  readonly fx?: number,
  readonly isin?: string,
  readonly date: Date,
  readonly dateString: string,
  readonly timestamp: number,
  type?: string,
  sharePrice?: number,
  shareCount?: number,
  shareCurrency?: string
}
/**
 we want to decorate transactions with augmented information that can be parsed from its
 description and other properties like orderID in order to be able to present transactions in
 a better way whether through the transaction list or chart
 TODO: separate decoration and CSV extraction. Keep csv extraction for cleaning up property names and adding dates functions
 TODO: Make safe floating point operations using moneysafe
 Keep decorateTransactions for adding new properties from description and linking transactions together
*/
function decorateTransactions(transactions: Transaction[] = []) : Transaction[] {
  const decorated = transactions.map(transaction => {
    if (!transaction || !transaction.description) {
      return transaction
    }

    const { description } = transaction;
    if (REGEXES.fee.test(description)) {
      transaction.type = 'fee'
      return transaction
    }

    if (REGEXES.fx.test(description)) {
      transaction.type = 'fx'
      return transaction
    }

    if (REGEXES.buy.test(description)) {
      const [, shareCount, sharePrice, shareCurrency] = REGEXES.buy.exec(description) || []
      transaction.type = 'buy'
      transaction.shareCount = parseFloat(shareCount)
      transaction.sharePrice = parseFloat(sharePrice)
      transaction.shareCurrency = shareCurrency
      return transaction
    }

    if (REGEXES.sell.test(description)) {
      const [, shareCount, sharePrice, shareCurrency] = REGEXES.sell.exec(description) || []
      transaction.type = 'sell'
      transaction.shareCount = parseFloat(shareCount)
      transaction.sharePrice = parseFloat(sharePrice)
      transaction.shareCurrency = shareCurrency
      return transaction
    }

    if (REGEXES.dividend.test(description)) {
      transaction.type = 'dividend'
      return transaction
    }

    if (REGEXES.interest.test(description)) {
      transaction.type = 'interest'
      return transaction
    }

    if (REGEXES.deposit.test(description)) {
      transaction.type = 'deposit'
      return transaction
    }

    if (REGEXES.withdrawal.test(description)) {
      transaction.type = 'withdrawal'
      return transaction
    }

    transaction.type = 'unknown'
    return transaction;
  })

  return decorated
}

export { decorateTransactions }


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
