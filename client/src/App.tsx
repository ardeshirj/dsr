import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRate,
  fetchCompoundCurrentRate,
  fetchCompoundHistoricalRate,
  fetchDSRCurrentRate,
  fetchDSRHistoricalRate,
  fetchBZXHistoricalRate,
} from "./features/graph/graphSlice";

import './App.css';
import { RootState } from './app/store';
import Graph from './features/graph/Graph';
import { dsrContract, compoundContract } from "./services/rate.service";

function App() {
  const dispatch = useDispatch();

  const {
    isLoading,
    compoundRates,
    dsrRates,
    bzxRates,
  } = useSelector(
    (state: RootState) => state.graph
  );

  useEffect(() => {
    dispatch(fetchRate());

    // dispatch(fetchDSRCurrentRate());
    // dispatch(fetchCompoundCurrentRate());

    dispatch(fetchCompoundHistoricalRate());
    dispatch(fetchDSRHistoricalRate());
    dispatch(fetchBZXHistoricalRate());

  }, [dispatch]);

  // compoundContract.on('AccrueInterest', () => {
  //   console.log("AccrueInterest happened!");
  //   console.log("Getting new current supply rate...");
  //   dispatch(fetchCurrentRate());
  // });

  return (
    <div className="App">
      <header className="App-header">
        { isLoading
            ? <div>Loading...</div>
            : <Graph compoundRates={compoundRates} dsrRates={dsrRates} bzxRates={bzxRates} />
        }
      </header>
    </div>
  );
}

export default App;
