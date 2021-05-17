import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from './app/store';
import Graph from './features/graph/Graph';
import { compoundContract } from "./services/rate.service";
import './App.css';
import {
  fetchRate,
  fetchCurrentRates,
  fetchHistoricalRate
} from "./features/graph/graphSlice";

function App() {
  const dispatch = useDispatch();

  const {
    isLoading,
    compoundRates,
    makerDaoRates,
    error
  } = useSelector(
    (state: RootState) => state.graph
  );

  useEffect(() => {
    dispatch(fetchRate());
    dispatch(fetchHistoricalRate());
  }, [dispatch]);

  compoundContract.on('AccrueInterest', () => {
    console.log("AccrueInterest happened!");
    console.log("Getting new current supply rate...");
    dispatch(fetchRate());
    dispatch(fetchCurrentRates());
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>On-Chain Protocols DAI Rates</h1>
        <h3>Automatically will update once new interest rate is received</h3>
        { isLoading
            ? <div>Loading...</div>
            : <Graph compoundRates={compoundRates} makeDaoRates={makerDaoRates} error={error} />
        }
      </header>
    </div>
  );
}

export default App;
