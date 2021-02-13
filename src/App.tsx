import React from 'react';
import { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { readString } from 'react-papaparse'
import { transactionsFromCSV } from './csvUtils'
import { Transaction } from './transactionUtils'

import Home from './Home'
import TradedSymbols from './TradedSymbols.js'

import './App.css';

const papaConfig = { header: true}

const getLocalTransactions = () =>
  fetch('./Account.csv')
  .then(res => res.text());

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
          <h3>Degiro charts</h3>
          <nav>
              <Link to="/">Home</Link>
              <Link to="/traded-stocks">Traded symbols</Link>
          </nav>
      </header>

        <Switch>
          <Route path="/traded-stocks">
            <TradedSymbols transactions={transactions} />
          </Route>
          <Route path="/">
            <Home
              transactions={transactions}
              setTransactions={setTransactions}
              hideNilTransactions={hideNilTransactions}
            />
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
