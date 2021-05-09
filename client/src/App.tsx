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

function App() {
  const dispatch = useDispatch();

  const {
    isLoading,
    error,
    currentRate,
    historicalRates
  } = useSelector(
    (state: RootState) => state.graph
  );

  useEffect(() => {
    dispatch(requestRate());
    dispatch(fetchCurrentRate());
    dispatch(fetchHistoricalRate());
  }, [dispatch]);

  return (
    <div className="App">
      <header className="App-header">
        <Graph
          isLoading={isLoading}
          error={error}
          currentRate={currentRate}
          historicalRates={historicalRates}
        />
      </header>
    </div>
  );
}

export default App;
