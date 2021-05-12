import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRate,
  fetchCurrentRates,
  fetchHistoricalRate
} from "./features/graph/graphSlice";

import './App.css';
import { RootState } from './app/store';
import Graph from './features/graph/Graph';
import { Protocol } from "./services/rate.service";

function App() {
  const dispatch = useDispatch();

  const {
    isLoading,
    compoundRates,
    makerDaoRates,
  } = useSelector(
    (state: RootState) => state.graph
  );

  useEffect(() => {
    dispatch(fetchRate());

    dispatch(fetchCurrentRates());
    // dispatch(fetchCurrentRate(Protocol.DSR));
    // dispatch(fetchCurrentRate(Protocol.BZX));

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
            : <Graph compoundRates={compoundRates} makeDaoRates={makerDaoRates} />
        }
      </header>
    </div>
  );
}

export default App;
