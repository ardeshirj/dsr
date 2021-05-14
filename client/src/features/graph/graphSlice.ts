import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../app/store';
import { getHistoricalRate, getCurrentRates, Protocol, Rate } from '../../services/rate.service';

interface GraphState {
  isLoading: boolean;
  compoundRates: Rate[],
  makerDaoRates: Rate[],
  error: string;
}

export const initialState: GraphState = {
  isLoading: false,
  compoundRates: [],
  makerDaoRates: [],
  error: null
};

export const graphSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    fetchRate: (state) => {
      state.isLoading = true;
      state.compoundRates = [];
      state.error = null;
    },
    fetchRateFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload
    },
    // Compound
    fetchedCompoundCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.compoundRates = appendNewRate(state.compoundRates, action.payload);
      state.error = null;
    },
    fetchedCompoundHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.compoundRates = action.payload;
      state.error = null;
    },
    // MakerDao
    fetchedMakerDaoCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.makerDaoRates = appendNewRate(state.makerDaoRates, action.payload)
      state.error = null;
    },
    fetchedMakerDaoHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.makerDaoRates = action.payload;
      state.error = null;
    },
  },
});

const isLoading = (state: GraphState) => {
  return state.compoundRates &&
    state.compoundRates.length === 0 &&
    state.makerDaoRates &&
    state.makerDaoRates.length === 0;
}

const appendNewRate = (rates: Rate[], newRate: Rate) => {
  const newRates = rates.slice();
  newRates.push(newRate);
  return newRates;
}

export const {
  fetchRate,
  fetchRateFailed,
  // compound
  fetchedCompoundCurrentRate,
  fetchedCompoundHistoricalRate,
  // MakerDao
  fetchedMakerDaoCurrentRate,
  fetchedMakerDaoHistoricalRate,
} = graphSlice.actions;

export default graphSlice.reducer;

  export const fetchCurrentRates = (): AppThunk => async dispatch => {
  try {
    const currentRate = await getCurrentRates();
    dispatch(fetchedCompoundCurrentRate(currentRate[0]));
    dispatch(fetchedMakerDaoCurrentRate(currentRate[1]));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchHistoricalRate = (): AppThunk => async dispatch => {
  try {
    const compoundHistoricalRates = await getHistoricalRate(Protocol.Compound);
    dispatch(fetchedCompoundHistoricalRate(compoundHistoricalRates));

    const makerDAOHistoricalRates = await getHistoricalRate(Protocol.MakerDAO);
    dispatch(fetchedMakerDaoHistoricalRate(makerDAOHistoricalRates));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}
