import './App.css';
import { CSVReader, readString } from 'react-papaparse'
import { useEffect, useState } from 'react'
import { transactionsFromCSV } from './utils'
import React from 'react';
import Chart from './Chart'
import AccountSummary from './AccountSummary'
const papaConfig = { header: true}

const getLocalTransactions = () =>
  fetch('./Account.csv')
  .then(res => res.text());

function App() {
  const [transactions, setTransactions] = useState([]);
  const [hideNilTransactions] = useState(true)
  const [csvParsingError, setCsvParsingError] = useState(false)

  const handleOnDrop = (results) => {
    setCsvParsingError(false)
    setTransactions(transactionsFromCSV(results.map(r => r.data)))
  }

  const handleOnError = (err) => {
    setCsvParsingError(err);
  }
  const handleOnRemoveFile = () => setTransactions([])

  useEffect(() => {
    async function setDefaultTransactions() {
      const csvString = await getLocalTransactions()
      const parsedTransactions = readString(csvString, papaConfig).data
      setTransactions(transactionsFromCSV(parsedTransactions))
    }

    setDefaultTransactions()
  }, [])

  return (
    <div className="">
      <header className="App-header">
        <h1>Degiro charts</h1>
      </header>
      <div className="container">
        <div className="row" style={{ paddingTop: "20px" }}>
          <div className="square">
            <CSVReader
              onDrop={handleOnDrop}
              onError={handleOnError}
              style={{}}
              config={papaConfig}
              addRemoveButton
              onRemoveFile={handleOnRemoveFile}
            >
              <span>Drop CSV file here or click to upload.</span>
            </CSVReader>
            <p style={{ color: "red" }}>
              {csvParsingError ? csvParsingError.message : ""}
            </p>
          </div>
          <div className="square">
            <h2>Account summary</h2>
            <AccountSummary transactions={transactions}></AccountSummary>
          </div>
        </div>
        <div className="row">
          <div className="square">
            <h2>Cash balance over time</h2>
            <Chart style={{ padding: 0 }} transactions={transactions} />
          </div>
          <div className="square">
            <h2>Transactions History</h2>
            <div className="scroll">
              <TransactionsList
                transactions={transactions}
                hideNilTransactions={hideNilTransactions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default App;
