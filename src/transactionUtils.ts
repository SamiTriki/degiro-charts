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
  /** @example "GBP" @description The currency in which the transaction is settled, the 'value' entry is in that currency */
  readonly currency?: string,
  /** @example 415 @description Value of transaction in the currency specified */
  readonly value?: number,
  /** @example "SUPERFASTCARS MOTORS INC. C" @description  Stock being bought or sold as a descriptive string */
  readonly product?: string,
  /** @example "Some description" @description Describes the transaction with informations relative to the nature of the product being exchanged or the fee */
  readonly description?: string,
  /** @example "dummy-dummy-dummy-18" @description What order is this transaction attached to. Fx credits, debits, transaction fees share the orderID of a stock purchase */
  readonly orderId?: string,
  /** @example 1.21233 @description Exchange rate multiplier. Appears for FX credits/Debit in a currency other than the account currency and is equal to home_currency / currency */
  readonly fx?: number,
  /** @example "US00000R000FAKE" @description ISIN of the product being purchased. Cross exchange unique identifier, can be mapped to a symbol via the adequate api / mapping */
  readonly isin?: string,
  /** @example new Date() @description The date the transaction is executed */
  readonly date: Date,
  /** @example "2020-01-01" @description String for representing the day date a transaction happened. used to sort transactions into different periods */
  readonly dateString: string,
  /** @example 1559925240000 @description Timestamp of date, used for easy sorting */
  readonly timestamp: number,
  /** @description Type of the transaction used to categorise and sort it */
  type: 'deposit' | 'withdrawal' | 'interest' | 'dividend' | 'fx' | 'fee' | 'buy' | 'sell' | 'unknown',
  /** @example 2 @description Numb of shares bought or sold, only available for 'buy' or 'sell' type */
  shareCount?: number,
  /** @example "GBX" @description Currency used to purchase the shares, the 'sharePrice' entry is in that currency
   * It can be different fron the 'currency' property. For example shares bought on the London stock exchange use GBX which
   * is a sub denomination of the GBP. */
  shareCurrency?: string
  /** @example 400 @description Price of the share at the time of buying or selling, in the 'shareCurrency' specified. only available for 'buy' or 'sell' type */
  sharePrice?: number,
}

/**
 * Takes an array of transactions and gives them a "type" property infered from its description
 * in order to facilitate sorting and presentation.
 *
 * 'sell' and 'buy' type transactions are augmented with 'sharePrice', 'shareCount', 'shareCurrency'
 * @beta
 * TODO: separate decoration and CSV extraction. Keep csv extraction for cleaning up property names and adding dates functions
 * TODO: Make safe floating point operations using dinero.js or other
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

/**
 * Gives total cash balance periodically sorted
 * @param transactions
 * @param period
 * @returns Dictionary with period as key.
 *
 * @example
 * ```ts
 *  transactionsPerPeriod([Transaction, Transaction, Transaction], 'month')
 * // output
 * {
 *  '2020-01': { value, total, transactions, prevPeriod: undefined},
 *  '2020-02': { value, total, transactions, prevPeriod: '2020-01'}
 * }
 * ```
 *  @example
 *  Day period "2020-01-01"
 *  Month period "2020-01"
 *  Year period "2020"
 *
  */
const transactionsPerPeriod = (transactions: Transaction[], period : 'day' | 'month' | 'year') : Record<string, any> =>
  transactions.reduce((dates, current) => {
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
  }, {} as Record<string, any>)

export { decorateTransactions, transactionsPerPeriod }


 /*
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
