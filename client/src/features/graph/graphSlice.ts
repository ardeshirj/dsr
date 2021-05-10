import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../app/store';
import { getCompoundCurrentRate, getDSRCurrentRate, getHistoricalRate, Rate } from '../../services/rate.service';

interface GraphState {
  isLoading: boolean;
  compoundRates: Rate[],
  dsrRates: Rate[],
  bzxRates: Rate[],
  error: string;
}

export const initialState: GraphState = {
  isLoading: false,
  compoundRates: [],
  dsrRates: [],
  bzxRates: [],
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
      state.compoundRates = state.compoundRates.concat(action.payload);
      state.error = null;
    },
    fetchedCompoundHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.compoundRates = action.payload;
      state.error = null;
    },
    // DSR
    fetchedDSRCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.dsrRates = state.dsrRates.concat(action.payload);
      state.error = null;
    },
    fetchedDSRHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.dsrRates = action.payload;
      state.error = null;
    },
    // BZX
    fetchedBZXCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.bzxRates = state.bzxRates.concat(action.payload);
      state.error = null;
    },
    fetchedBZXHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.bzxRates = action.payload;
      state.error = null;
    }
  },
});

const isLoading = (state: GraphState) => {
  return state.compoundRates &&
    state.compoundRates.length == 0 &&
    state.dsrRates &&
    state.dsrRates.length == 0 &&
    state.bzxRates &&
    state.bzxRates.length == 0
}

export const {
  fetchRate,
  fetchRateFailed,
  // compound
  fetchedCompoundCurrentRate,
  fetchedCompoundHistoricalRate,
  // DSR
  fetchedDSRCurrentRate,
  fetchedDSRHistoricalRate,
  // BZX
  fetchedBZXCurrentRate,
  fetchedBZXHistoricalRate,
} = graphSlice.actions;

export default graphSlice.reducer;

export const fetchCompoundCurrentRate = (): AppThunk => async dispatch => {
  try {
    const currentRate = await getCompoundCurrentRate();
    dispatch(fetchedCompoundCurrentRate(currentRate));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchCompoundHistoricalRate = (): AppThunk => async dispatch => {
  try {
    const historicalRates = await getHistoricalRate('compound');
    dispatch(fetchedCompoundHistoricalRate(historicalRates));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchDSRCurrentRate = (): AppThunk => async dispatch => {
  try {
    const currentRate = await getDSRCurrentRate();
    dispatch(fetchedDSRCurrentRate(currentRate));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchDSRHistoricalRate = (): AppThunk => async dispatch => {
  try {
    const historicalRates = await getHistoricalRate('dsr');
    dispatch(fetchedDSRHistoricalRate(historicalRates));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchBZXCurrentRate = (): AppThunk => async dispatch => {
  try {
    const currentRate = await getDSRCurrentRate();
    dispatch(fetchedBZXCurrentRate(currentRate));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchBZXHistoricalRate = (): AppThunk => async dispatch => {
  try {
    const historicalRates = await getHistoricalRate('bzx');
    dispatch(fetchedBZXHistoricalRate(historicalRates));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

