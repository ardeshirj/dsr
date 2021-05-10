import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  requestRate,
  fetchCurrentRate,
  fetchHistoricalRate
} from "./features/graph/graphSlice";

import './App.css';
import { RootState } from './app/store';
import Graph from './features/graph/Graph';
import { contract } from "./services/rate.service";

function App() {
  const dispatch = useDispatch();

  const {
    isLoading,
    rates
  } = useSelector(
    (state: RootState) => state.graph
  );

  useEffect(() => {
    dispatch(requestRate());
    dispatch(fetchCurrentRate());
    dispatch(fetchHistoricalRate());
  }, [dispatch]);

  contract.on('AccrueInterest', () => {
    console.log("AccrueInterest happened!");
    console.log("Getting new current supply rate...");
    dispatch(fetchCurrentRate());
  })

  return (
    <div className="App">
      <header className="App-header">
        <Graph isLoading={isLoading} rates={rates}/>
      </header>
    </div>
  );
}

export default App;
