function TransactionsList({transactions, hideNilTransactions}) {
  let transactionsCopy = [...transactions]

  if (!transactions.length) {
    return <ul></ul>
  }

  if (hideNilTransactions) {
    transactionsCopy = transactionsCopy.filter(t => t.value !== 0)
  }

  return (
    <ul style={{listStyle: 'none', textAlign: 'left', fontSize: '1rem'}}>
    {
      transactionsCopy.map((t, idx) => {
        return <TransactionLineItem key={idx} {...t} />
      })
    }
    </ul>
  )

}

function TransactionLineItem({description, value, dateString, currency}) {
  return (
    <li>
      <span style={{ fontStyle: "italic", fontSize: ".8rem" }}>
        {dateString}
      </span>
      {" "}{description} <SignedAmount value={value} currency={currency} />
    </li>
  );
}

function SignedAmount({value, currency}) {
  const isPositive = value >= 0;
  return (
    <span style={{color: isPositive ? 'green' : 'red'}}>
      {currency}{value.toFixed(2)}
    </span>
  )
}

export default TransactionsList
