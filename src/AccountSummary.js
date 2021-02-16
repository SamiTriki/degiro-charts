import { getDashboardInfo } from './transactionUtils.js'

function AccountSummary({ transactions }) {
  const { totalTrades, realisedGains, totalFees, totalDividends, totalWithdrawals, totalDeposits, totalSharesOnMarket, } = getDashboardInfo(transactions);

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


export default AccountSummary
