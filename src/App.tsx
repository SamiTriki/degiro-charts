import React from 'react'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ReactComponent as Logo } from './logo.svg'

import { readString } from 'react-papaparse'
import { transactionsFromCSV } from './csvUtils'
import { Transaction } from './transactionUtils'

import Home from './Home'
import TradedSecurities from './TradedSecurities'

import './App.css'

const papaConfig = { header: true }

const getLocalTransactions = () =>
  fetch('./Account.csv').then(res => res.text())

function App() {
  const [transactions, setTransactions] = useState([] as Transaction[])
  const [hideNilTransactions] = useState(true)

  useEffect(() => {
    async function setDefaultTransactions() {
      const csvString = await getLocalTransactions()
      const parsedTransactions = readString(csvString, papaConfig).data
      setTransactions(transactionsFromCSV(parsedTransactions))
    }

    setDefaultTransactions()
  }, [])

  return (
    <Router>
      <header className="App-header">
        <div className="App-logo">
          <Logo />
          <span>DEGIRO Charts</span>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/">HOME</Link>
            </li>
            <li>
              <Link to="/traded-stocks">TRADED SECURITIES</Link>
            </li>
          </ul>
        </nav>
      </header>
      {transactions.length ? (
        <Switch>
          <Route path="/traded-stocks">
            <TradedSecurities transactions={transactions} />
          </Route>
          <Route path="/">
            <Home
              transactions={transactions}
              setTransactions={setTransactions}
              hideNilTransactions={hideNilTransactions}
            />
          </Route>
        </Switch>
      ) : (
        <div className="container">Waiting for transactions</div>
      )}
    </Router>
  )
}

export default App
