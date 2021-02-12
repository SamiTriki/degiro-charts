import { useState } from 'react'

import { CSVReader } from 'react-papaparse'
import Chart from './Chart'
import TransactionsList from './TransactionsList'

import './App.css';
import AccountSummary from './AccountSummary'
import { transactionsFromCSV } from './utils'
const papaConfig = { header: true}


function Home({setTransactions, transactions, hideNilTransactions}) {
  const [csvParsingError, setCsvParsingError] = useState(false)

  const handleOnDrop = (results) => {
    setCsvParsingError(false)
    setTransactions(transactionsFromCSV(results.map(r => r.data)))
  }

  const handleOnError = (err) => {
    setCsvParsingError(err);
  }
  const handleOnRemoveFile = () => setTransactions([])

  return (
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
  );
}

export default Home;
