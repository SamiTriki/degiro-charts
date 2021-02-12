function AccountSummary({ transactions }) {
  const { totalTrades, realisedGains, totalFees, totalDividends, totalWithdrawals, totalDeposits, totalSharesOnMarket, } = getAccountSummaryInfo(transactions);

  return (
    <ul>
      <li>Trades: {totalTrades}</li>
      <li>Realised gains: {realisedGains.toFixed(2)}</li>
      <li>Fees: {totalFees.toFixed(2)}</li>
      <li>Dividends: {totalDividends}</li>
      <li>Deposited: {totalDeposits}</li>
      <li>Withdrawawn: {totalWithdrawals}</li>
      <li>Shares On Market: {totalSharesOnMarket}</li>
    </ul>
  )
}

 // Find interesting insights about transactions
 function getAccountSummaryInfo(transactions = []) {
  const significantValues = transactions.reduce((d, curr) => {
    if (curr.type === 'buy') {
      d.totalTrades++
      d.totalSharesOnMarket = d.totalSharesOnMarket + curr.shareCount
    }

    if (curr.type === 'sell') {
      d.totalTrades++
      d.totalSharesOnMarket = d.totalSharesOnMarket - curr.shareCount
    }

    if (curr.type === 'fee') {
      d.totalFees = d.totalFees + curr.value
    }

    if (curr.type === 'dividend') {
      d.totalDividends = d.totalDividends + curr.value
    }

    if (curr.type === 'withdrawal') {
      d.totalWithdrawals = d.totalWithdrawals + curr.value
    }

    if (curr.type === 'deposit') {
      d.totalDeposits = d.totalDeposits + curr.value
    }

    d.realisedGains = d.realisedGains + curr.value

    return d
  },{
    totalTrades: 0, // total of sell and buys
    realisedGains: 0, // Cash balance
    totalFees: 0, // total fees value
    totalDividends: 0, // total dividend value, sort by stock?
    totalWithdrawals: 0, // total withdrawal values
    totalDeposits: 0,  // total deposit values
    totalSharesOnMarket: 0, // totalbuys - totalsells
  })

  return significantValues
 }

export default AccountSummary
