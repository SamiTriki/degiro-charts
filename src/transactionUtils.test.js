import { decorateTransactions } from './transactionUtils.js';

describe("Decorate transactions", () => {

  it("Correctly categorises a deposit", () => {
    let deposit = decorateTransactions([{description: 'Deposit'}])
    let notDeposits = decorateTransactions([{description: 'Looks like a deposit but isnnt'}, {description: 'buy 3 some company Deposit deposit at some sum'}])
    expect(deposit[0].type).toBe('deposit')
    expect(notDeposits[0].type).toBe('unknown')
    expect(notDeposits[1].type).toBe('unknown')
  })

  it("Correctly categorises a withdrawal", () => {
    let withdrawal = decorateTransactions([{description: 'Withdrawal'}])
    let notWithdrawal = decorateTransactions([{description: 'Looks like a withdrawal but isnnt'}, {description: 'buy 3 some company Withdrawal withdrawal ltd at some sum'}])
    expect(withdrawal[0].type).toBe('withdrawal')
    expect(notWithdrawal[0].type).toBe('unknown')
    expect(notWithdrawal[1].type).toBe('unknown')
  })

  it("Correctly categorises a interest", () => {
    let interest = decorateTransactions([{description: 'Money Market fund conversion: Sell 329.32 at 1 GBP'}, {description: 'Fund Distribution'}])
    let notInterest = decorateTransactions([{description: 'Buy some money market fund share at 300gbp'}, {description: 'Buy some fund distribution at 300gbp'}])
    expect(interest[0].type).toBe('interest')
    expect(interest[1].type).toBe('interest')

    expect(notInterest[0].type).toBe('unknown')
    expect(notInterest[1].type).toBe('unknown')
  })

  it("Correctly categorises a dividend", () => {
    let dividend = decorateTransactions([{description: 'Dividend'}, {description: 'Capital return'}])
    let notdividend = decorateTransactions([{description: 'Buy some Dividend that doesnt makes sense'}, {description: 'Buy some Capital Return which doesnt makes sense either'}])
    expect(dividend[0].type).toBe('dividend')
    expect(dividend[1].type).toBe('dividend')

    expect(notdividend[0].type).toBe('unknown')
    expect(notdividend[1].type).toBe('unknown')
  })

  it("Correctly categorises a fx", () => {
    let fx = decorateTransactions([{description: 'FX Credit'}, {description: 'FX Debit'}])
    let notfx = decorateTransactions([{description: 'Buy some FX Credit ltd'}, {description: 'Buy some FX Debit ltd'}])
    expect(fx[0].type).toBe('fx')
    expect(fx[1].type).toBe('fx')

    expect(notfx[0].type).toBe('unknown')
    expect(notfx[1].type).toBe('unknown')
  })

  it("Correctly categorises a fee", () => {
    let fee = decorateTransactions([{description: 'DEGIRO signup Fee'}, {description: 'New customer Reimbursement'}, {description: 'degiro import fee'}, {description: 'LSE stamp duty'}, {description: 'DEGIRO Exchange Connection Fee 2021 (New York Stock Exchange - NSY)'}])
    let notfee = decorateTransactions([{description: 'Buy some fee clochette ltd'}, {description: 'Buy some call of duty'}, {description: 'some random string that finishes with fee'}])
    expect(fee[0].type).toBe('fee')
    expect(fee[1].type).toBe('fee')
    expect(fee[2].type).toBe('fee')
    expect(fee[3].type).toBe('fee')
    expect(fee[4].type).toBe('fee')

    expect(notfee[0].type).toBe('unknown')
    expect(notfee[1].type).toBe('unknown')
  })

  describe("buy", () => {
    let buy = decorateTransactions([{description: 'Buy 200 SUPERGROCERIES (PLCSMH)@198.15 GBX (GB000000001FAKE)'}, {description: 'Buy 2 SUPERSCIENCE SCIENTIFIC@516.1 USD (US000000SUPERFAKE)'}, {description: 'Buy 1 MEGACORP C@78 USD (USXXXXWYYYYYFAKE)'}])
    let notBuy = decorateTransactions([{description: 'Buy 200 SUPERGROCERIES (PLCSMH) forinsteadofatsign 198.15 GBX (GB000000001FAKE)'}, {description: 'Buy 200 SUPERGROCERIES (PLCSMH) @198.15 NOCURRENCY (GB000000001FAKE)'}, {description: 'Buy NOSHARESCOUNT SUPERGROCERIES (PLCSMH) @198.15 GBX (GB000000001FAKE)'}, {description: 'Buy 200 SUPERGROCERIES (PLCSMH) @noprice GBX (GB000000001FAKE)'}])

    it("Correctly categorises a buy", () => {
      expect(buy[0].type).toBe('buy')
      expect(buy[1].type).toBe('buy')
      expect(buy[2].type).toBe('buy')

      expect(notBuy[0].type).toBe('unknown')
      expect(notBuy[1].type).toBe('unknown')
      expect(notBuy[2].type).toBe('unknown')
      expect(notBuy[3].type).toBe('unknown')
    })

    it("Assigns the share count price and currency properly", () => {
      expect(buy[0].sharePrice).toBeCloseTo(198.15)
      expect(buy[1].sharePrice).toBeCloseTo(516.10)
      expect(buy[2].sharePrice).toBeCloseTo(78)

      expect(buy[0].shareCount).toBeCloseTo(200)
      expect(buy[1].shareCount).toBeCloseTo(2)
      expect(buy[2].shareCount).toBeCloseTo(1)

      expect(buy[0].shareCurrency).toBe('GBX')
      expect(buy[1].shareCurrency).toBe('USD')
      expect(buy[2].shareCurrency).toBe('USD')
    })
  })

  describe("sell", () => {
    let sell = decorateTransactions([{description: 'Sell 200 SUPERGROCERIES (PLCSMH)@198.15 GBX (GB000000001FAKE)'}, {description: 'Sell 2 SUPERSCIENCE SCIENTIFIC@516.1 USD (US000000SUPERFAKE)'}, {description: 'Sell 1 MEGACORP C@78 USD (USXXXXWYYYYYFAKE)'}])
    let notSell = decorateTransactions([{description: 'Sell 200 SUPERGROCERIES (PLCSMH) forinsteadofatsign 198.15 GBX (GB000000001FAKE)'}, {description: 'Sell 200 SUPERGROCERIES (PLCSMH) @198.15 NOCURRENCY (GB000000001FAKE)'}, {description: 'Sell NOSHARESCOUNT SUPERGROCERIES (PLCSMH) @198.15 GBX (GB000000001FAKE)'}, {description: 'Buy 200 SUPERGROCERIES (PLCSMH) @noprice GBX (GB000000001FAKE)'}])

    it("Correctly categorises a sell", () => {
      expect(sell[0].type).toBe('sell')
      expect(sell[1].type).toBe('sell')
      expect(sell[2].type).toBe('sell')

      expect(notSell[0].type).toBe('unknown')
      expect(notSell[1].type).toBe('unknown')
      expect(notSell[2].type).toBe('unknown')
      expect(notSell[3].type).toBe('unknown')
    })

    it("Assigns the share count price and currency properly", () => {
      expect(sell[0].sharePrice).toBeCloseTo(198.15)
      expect(sell[1].sharePrice).toBeCloseTo(516.10)
      expect(sell[2].sharePrice).toBeCloseTo(78)

      expect(sell[0].shareCount).toBeCloseTo(200)
      expect(sell[1].shareCount).toBeCloseTo(2)
      expect(sell[2].shareCount).toBeCloseTo(1)

      expect(sell[0].shareCurrency).toBe('GBX')
      expect(sell[1].shareCurrency).toBe('USD')
      expect(sell[2].shareCurrency).toBe('USD')
    })
  })

  it("Marks transaction as unknown when undetected", () => {
    let oddTransactions = decorateTransactions([{description: 'something'}, {description: 'some odd buy'}, {description: 'some odd sell'}])

    expect(oddTransactions[0].type).toBe('unknown')
    expect(oddTransactions[1].type).toBe('unknown')
    expect(oddTransactions[2].type).toBe('unknown')
  })

  it("Rejects oddly shaped transaction", () => {
    let oddTransactions = decorateTransactions([null, undefined, NaN, {description: null}, {"":""}])

    expect(oddTransactions[0]).toBe(null)
    expect(oddTransactions[1]).toBe(undefined)
    expect(oddTransactions[2]).toBe(NaN)
    expect(oddTransactions[3]).toStrictEqual({description: null})
    expect(oddTransactions[4]).toStrictEqual({"":""})
  })
})
